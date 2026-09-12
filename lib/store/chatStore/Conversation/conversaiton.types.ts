
import type { ChatConversation } from "@/lib/validation/conversation.schema"; 
import type { ChatMessage } from "@/lib/validation/message.schema";

export type ConversationLookupEntry = {
  conversationId: string;
  isDeleted: boolean;
};

export type UpsertConversationInput =
  | {
      kind: "full";
      conversation: ChatConversation;
    }
  | {
      kind: "mark-deleted";
      conversationId: string;
      userId: string;
    };

export type ConversationItemData = {
  id: string; // conversationId
  avatarInitials: string;
  contactName: string;
  isDeleted: boolean;
  content: string | null;
  createdAt: string | null;
  status: "sent" | "delivered" | "read" | "pending" | "failed" | null;
  isSentByMe: boolean;
  targetUserId: string;
  isDraft?: boolean;
};

export interface conversationSlice {
  // data
  conversationError: string | null;
  conversations: ChatConversation[] | [];
  conversationLookup: Map<string, ConversationLookupEntry>;
  conversationUiData: ConversationItemData[];
  activeConversationId: string | null;
  isLoadingConversations: boolean;
  conversationFetchedAt: number | null;

  // methods
  setActiveConversationId: (Id: string) => void;
  fetchConversations: (options?: { force?: boolean }) => Promise<void>;
  setConvLookup: () => void;
  setConversationUi: () => void;
  upsertConversation: (input: UpsertConversationInput) => void;
  removeConversationLocally: (conversationId: string) => void;
  bumpConvs: (
    conversationId: string,
    lastestMessage: ChatMessage,
  ) => ChatConversation[];
}
