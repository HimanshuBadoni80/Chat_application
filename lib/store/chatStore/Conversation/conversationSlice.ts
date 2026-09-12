import type { StateCreator } from "zustand";
import type { conversationSlice, ConversationLookupEntry } from "./conversaiton.types";
import type { ChatStore } from "../store";
import apiFetch from "@/lib/utils/fetchWrapper";
import type { ApiResponse } from "@/lib/types/apiResponse";
import type { ConversationDTO as ConversationDetails } from "@/lib/validation/conversation.schema";
import type { ChatMessage } from "@/lib/validation/message.schema";
import {
  hasSessionExpired,
  extractErrorMessage,
} from "@/lib/utils/handleStoreErrors";

const CONVERSATION_STALE_TIME = 30 * 1000;
export const createConversationSlice: StateCreator<
  ChatStore,
  [],
  [],
  conversationSlice
> = (set, get) => ({
  // data
  conversationError: null,
  conversations: [],
  conversationLookup: new Map<string, ConversationLookupEntry>(),
  conversationUiData: [],
  activeConversationId: null,
  isLoadingConversations: false,
  conversationFetchedAt: null,

  // methods
  setActiveConversationId: (ConversationId) =>
    set({ activeConversationId: ConversationId }),
  fetchConversations: async (options) => {
    const { force = false } = options ?? {};

    if (get().isLoadingConversations) return;

    if (!force && get().conversationFetchedAt) {
      const age = Date.now() - get().conversationFetchedAt!;
      if (age < CONVERSATION_STALE_TIME) return;
    }

    set({ isLoadingConversations: true });
    try {
      
      const response = await apiFetch<ApiResponse<ConversationDetails[]>>(
        "/api/conversations/conversationList",
      );

      if (!response.success) {
        throw response;
      }

      const conversations = response.data ?? [];

      // update the lastSyncedAt
      set({
        conversations,
        lastSyncedAt:
          conversations[0]?.lastMessage?.createdAt ?? new Date().toISOString(),
        conversationFetchedAt: Date.now(),
      });

      // call setConvLookup
      get().setConvLookup();

      // push data in messages
      set((state) => {
        const seededMessages: Record<string, ChatMessage[]> = {};

        conversations.forEach((conv) => {
          const stringId = conv._id.toString();
          // don't fill if we already have messages
          if (conv.lastMessage && !(stringId in state.messages)) {
            seededMessages[stringId] = [conv.lastMessage];
          }
        });

        return {
          messages: {
            ...state.messages,
            ...seededMessages,
          },
        };
      });
    } catch (error) {
      if (hasSessionExpired(error, get().disconnect)) return;
      set({
        conversationError: extractErrorMessage(
          error,
          "Unbale to load conversations",
        ),
      });
    } finally {
      set({ isLoadingConversations: false });
    }
  },
  setConvLookup: () => {
    const { conversations, user } = get();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const userId = user._id;

    const lookupMap = new Map<string, ConversationLookupEntry>();
    conversations.forEach((conv) => {
      const participant = conv.participants.find((p) => p._id !== userId);
      if (participant) {
        lookupMap.set(participant._id, {
          conversationId: conv._id,
          isDeleted: participant.user === null,
        });
      }
    });

    set({ conversationLookup: lookupMap });
    get().setContactUi();
    get().setConversationUi();
  },
  setConversationUi: () => {
    const { conversations, user, contactLookup } = get();
    if (!user) return;

    const currentUserId = user.uid;

    const conversationUiData = conversations.map((conv) => {
      const contact = conv.participants.find((p) => p.user?.uid !== currentUserId);
      const targetUserId = contact?._id || "";
      const isDeleted = contact?.user === null;

      // Name resolution priority:
      const nickname = contactLookup.get(targetUserId);
      let contactName = "Unknown user";
      if (nickname) {
        contactName = nickname;
      } else if (isDeleted) {
        contactName = "Deleted user";
      } else if (contact?.user?.username) {
        contactName = contact.user.username;
      }

      // Avatar logic
      const avatarInitials = contactName
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0].toUpperCase())
        .join("")
        .slice(0, 2);

      const lastMsg = conv.lastMessage;
      const isSentByMe = lastMsg?.senderId === user._id;

      // Check for drafts
      const draft = get().draftInputs[conv._id];
      const hasDraft = draft && draft.text.trim().length > 0;

      return {
        id: conv._id.toString(),
        avatarInitials,
        contactName,
        isDeleted,
        content: hasDraft ? draft.text : (lastMsg?.content ?? null),
        createdAt: hasDraft ? draft.createdAt : (lastMsg?.createdAt ?? conv.createdAt.toString()),
        status: hasDraft ? null : (isSentByMe ? (lastMsg?.status ?? "sent") : null),
        isSentByMe,
        targetUserId,
        isDraft: hasDraft,
      };
    });

    // Sort the UI data taking drafts into account
    conversationUiData.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    set({ conversationUiData });
  },
  upsertConversation: (input) => {
    if (input.kind === "full") {
      // Insert or replace a full conversation
      set((state) => {
        const exists = state.conversations.some(
          (c) => c._id === input.conversation._id,
        );

        const updated = exists
          ? state.conversations.map((c) =>
              c._id === input.conversation._id ? input.conversation : c,
            )
          : [input.conversation, ...state.conversations];

        // Sort by latest activity
        updated.sort((a, b) => {
          const timeA = a.lastMessage?.createdAt ?? a.createdAt;
          const timeB = b.lastMessage?.createdAt ?? b.createdAt;
          return new Date(timeB).getTime() - new Date(timeA).getTime();
        });

        return { conversations: updated };
      });
    }

    if (input.kind === "mark-deleted") {
      // Mark a specific participant as deleted
      set((state) => ({
        conversations: state.conversations.map((conv) => {
          if (conv._id !== input.conversationId) return conv;
          return {
            ...conv,
            participants: conv.participants.map((p) =>
              p._id === input.userId ? { ...p, user: null } : p,
            ),
          };
        }),
      }));
    }

    // Both paths rebuild the lookup (which cascades into setContactUi)
    get().setConvLookup();
  },
  removeConversationLocally: (conversationId: string) => {
    set((state) => ({
      conversations: state.conversations.filter((c) => c._id !== conversationId),
    }));
    get().setConvLookup();
  },
  bumpConvs: (conversationId, lastestMessage) => {
    // find conversation where id is ${conversationId} and put the message as lastMessage
    // then sort it.
    const updatedList = get().conversations.map((conv) => {
      if (conv._id === conversationId)
        return { ...conv, lastMessage: lastestMessage };
      return conv;
    });
    updatedList.sort((a, b) => {
      const timeA = a.lastMessage ? a.lastMessage.createdAt : a.createdAt;
      const timeB = b.lastMessage ? b.lastMessage.createdAt : b.createdAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
    return updatedList;
  },
});

/* TO-DO
in the UI, for deleted user. 
if (otherParticipant?.user === null) {
  // Show: Deleted account
  // Disable sending
}
*/
