import { mergeAndDedupe, hasRedirectTo } from "./message.utils";
import { messageSlice, historyProps, DraftInput } from "./message.types";
import { StateCreator } from "zustand";
import { ChatStore } from "../store";
import type {
  ChatMessage,
  MessageDto,
  OptimisticMessage,
  SendMessageInput,
} from "@/lib/validation/message.schema";
import { ApiResponse } from "@/lib/types/apiResponse";
import apiFetch, { ApiFetch } from "@/lib/utils/fetchWrapper";
import { isApiResponse } from "@/lib/types/apiResponse";
import {
  hasSessionExpired,
  extractErrorMessage,
} from "@/lib/utils/handleStoreErrors";
import type { ChatConversation } from "@/lib/validation/conversation.schema";

export const createMessageSlice: StateCreator<
  ChatStore,
  [],
  [],
  messageSlice
> = (set, get) => ({
  messageError: null,
  historyError: null,
  messages: {},
  draftInputs: {},
  lastSyncedAt: null,
  isSyncingMessages: false,
  isLoadingMessages: false,
  historyStateByConversation: {},
  setDraftInput: (id: string, draft: DraftInput | null) => {
    set((state) => {
      const newDrafts = { ...state.draftInputs };
      if (draft === null) {
        delete newDrafts[id];
      } else {
        newDrafts[id] = draft;
      }
      return { draftInputs: newDrafts };
    });
    // Update UI so the draft bumps to the top of the sidebar
    get().setConversationUi();
  },
  sendFirstMessage: async (contactId: string, content?: string) => {
    const { user, addMessage, upsertConversation, setConversationUi } = get();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const draftKey = `draft:${contactId}`;
    let draftMsg = get().messages[draftKey]?.[0];

    // If no existing draft message (not a retry), create one
    if (!draftMsg) {
      if (!content) return; // Missing content for new message

      draftMsg = {
        tempId: crypto.randomUUID(),
        conversationId: draftKey, // use draft key temporarily
        senderId: user._id,
        content,
        messageType: "text",
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      addMessage(draftKey, draftMsg);
    } else {
      // Re-mark as pending on retry
      draftMsg = { ...draftMsg, status: "pending" };
      addMessage(draftKey, draftMsg);
    }

    const msgForApi: SendMessageInput = {
      kind: "new",
      tempId: draftMsg.tempId,
      contactId,
      content: draftMsg.content,
      messageType: "text",
    };

    try {
      const response = await ApiFetch<
        ApiResponse<{ conversation: ChatConversation; message: ChatMessage }>
      >(`/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgForApi),
      });

      if (!response.success || !response.data) throw response;

      const { conversation, message } = response.data;

      // Swap the keys and merge
      set((state) => {
        const msgs = { ...state.messages };
        const existingDrafts = msgs[draftKey];

        // If the draft key still exists (WS didn't beat us to it)
        if (existingDrafts) {
          delete msgs[draftKey];
          // alternatively- const { [draftKey]: removed, ...remainingMsgs } = msgs;
          
          // Merge with any real array created by WS
          msgs[conversation._id] = [
            ...existingDrafts,
            ...(msgs[conversation._id] || []),
          ];
        }
        return { messages: msgs };
      });

      // Update the message status by adding the finalized server message
      addMessage(conversation._id, message);

      // Upsert conversation to trigger lookup rebuild
      upsertConversation({ kind: "full", conversation });
      setConversationUi(); // Explicitly sync UI
    } catch (error) {
      if (hasSessionExpired(error, get().disconnect)) return;
      addMessage(draftKey, { ...draftMsg, status: "failed" });
      set({
        messageError: extractErrorMessage(
          error,
          "Failed to send first message.",
        ),
      });
    }
  },
  addMessage: (conversationId: string, incoming: ChatMessage) => {
    // work is to push messages in the messages record

    set((state) => {
      const existingMessages = state.messages[conversationId] || [];

      const updated = mergeAndDedupe(existingMessages, [incoming]);
      const latest = updated.at(-1);
      if (latest) {
        const updatedList = get().bumpConvs(conversationId, latest);
        const currentSync = get().lastSyncedAt;
        if (!currentSync) {
          set({ lastSyncedAt: latest.createdAt, conversations: updatedList });
        } else {
          const newTime = new Date(latest.createdAt).getTime();
          const oldTime = new Date(currentSync).getTime();
          set({
            lastSyncedAt: newTime > oldTime ? latest.createdAt : currentSync,
            conversations: updatedList,
          });
        }
        // Conversations array changed, update the UI
        get().setConversationUi();
      }

      return {
        messages: {
          ...state.messages,
          [conversationId]: updated,
        },
      };
    });
  },
  setMessage: (conversationId: string, message: ChatMessage[]) => {
    // push the previous messages in the record
    // the conversation id is given this function from url parameters
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      // for the first time, the key with conversationId is undefined in the state so a default empty [] acts as a fallback.

      const updated = mergeAndDedupe(existingMessages, message);
      const latest = updated.at(-1);
      if (latest) {
        const updatedList = get().bumpConvs(conversationId, latest);
        const currentSync = get().lastSyncedAt;
        if (!currentSync) {
          set({ lastSyncedAt: latest.createdAt, conversations: updatedList });
        } else {
          const newTime = new Date(latest.createdAt).getTime();
          const oldTime = new Date(currentSync).getTime();
          set({
            lastSyncedAt: newTime > oldTime ? latest.createdAt : currentSync,
            conversations: updatedList,
          });
        }
        // Conversations array changed, update the UI
        get().setConversationUi();
      }

      return {
        messages: {
          ...state.messages,
          [conversationId]: updated,
        },
        isLoadingMessages: false,
      };
    });
  },
  sendMessage: async (conversationId: string, text: string) => {
    const { user, addMessage } = get();

    if (!user) {
      console.error("Critical; Error: tried to send message without a user");
      window.location.href = "/login";
      return;
    } // util for this

    const tempId = crypto.randomUUID(); // native browser UUID
    const newMessage: OptimisticMessage = {
      tempId,
      conversationId,
      senderId: user._id,
      content: text,
      messageType: "text",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // call the addmessage()
    addMessage(conversationId, newMessage);

    const msgForApi: SendMessageInput = {
      kind: "existing",
      tempId,
      conversationId,
      content: text,
      messageType: "text",
    };

    try {
      // send the message
      const response = await apiFetch<ApiResponse<MessageDto>>(
        `/api/messages/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(msgForApi),
        },
      );

      if (!response.success || !response.data) {
        throw response;
      }

      // the response.data IS a MessageDto, which is a ChatMessage, but setMessage expects a Partial update...
      // Wait, earlier setMessage was changed to accept ChatMessage[].
      // In sendMessage, addMessage is called with response.data.
      addMessage(conversationId, response.data);
    } catch (error) {
      if (hasSessionExpired(error, get().disconnect)) return;
      // Wait, I will use `addMessage` to replace it since it dedupes by tempId!
      addMessage(conversationId, { ...newMessage, status: "failed" });
      set({
        messageError: extractErrorMessage(error, "Unable to send message."),
      });
    }
  },
  fetchOlderMessages: async (conversationId: string) => {
    const { messages, setMessage, historyStateByConversation } = get();

    // is the conversation registered
    const historyObj = historyStateByConversation[conversationId];

    // history found then
    if (
      historyObj &&
      (historyObj.isFetchingHistory || historyObj.hasReachedTop)
    ) {
      return;
    } else if (!historyObj) {
      set((state) => {
        const registerHistory: historyProps = {
          hasReachedTop: false,
          isFetchingHistory: true,
          historyError: null,
        };
        return {
          historyStateByConversation: {
            ...state.historyStateByConversation,
            [conversationId]: registerHistory,
          },
        };
      });
    } else {
      set((state) => {
        return {
          historyStateByConversation: {
            ...state.historyStateByConversation,
            [conversationId]: {
              hasReachedTop: false,
              isFetchingHistory: true,
              historyError: null,
            },
          },
        };
      });
    }

    const currentMessages = messages[conversationId];
    // Possible runtime crash when messages are unavailable
    if (!currentMessages || currentMessages.length === 0) {
      set((state) => {
        return {
          historyStateByConversation: {
            ...state.historyStateByConversation,
            [conversationId]: {
              hasReachedTop: false,
              isFetchingHistory: false,
              historyError: null,
            },
          },
        };
      });
      return;
    }

    const { createdAt } = currentMessages[0]; // from the oldest array

    try {
      const response = await apiFetch<ApiResponse<MessageDto[]>>(
        `/api/messages/${conversationId}?before=${createdAt}`,
      );
      // Stop fetching if we hit the very beginning of the chat
      if (!response.data || response.data.length === 0) {
        set((state) => {
          return {
            historyStateByConversation: {
              ...state.historyStateByConversation,
              [conversationId]: {
                hasReachedTop: true,
                isFetchingHistory: false,
                historyError: null,
              },
            },
          };
        });
        return;
      }
      setMessage(conversationId, response.data);
    } catch (error) {
      let err = "Failed to fetch older messages.";
      if (isApiResponse(error)) {
        if (error.error?.code === "NO_ACTIVE_SESSION") {
          const basePath = hasRedirectTo(error.data)
            ? error.data.redirectTo
            : "/login";
          const url = new URL(basePath, window.location.origin);
          url.searchParams.set("reason", "session_expired");

          get().disconnect();

          window.location.href = url.toString();
        }
        err = error.message;
      }
      if (error instanceof Error) {
        err = error.message;
      }
      set((state) => {
        return {
          historyStateByConversation: {
            ...state.historyStateByConversation,
            [conversationId]: {
              hasReachedTop: false,
              isFetchingHistory: false,
              historyError: err,
            },
          },
        };
      });
    } finally {
      set((state) => {
        const { hasReachedTop, historyError } =
          state.historyStateByConversation[conversationId];
        return {
          historyStateByConversation: {
            ...state.historyStateByConversation,
            [conversationId]: {
              hasReachedTop,
              isFetchingHistory: false,
              historyError,
            },
          },
        };
      });
    }
  },
  unifiedSyncUtility: async (
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    set({ isSyncingMessages: true });
    // Fire the HTTP Sync: fetch(/api/messages/sync?since=...)
    const { lastSyncedAt } = get();

    let httpReport = { success: false, message: "" };

    if (!lastSyncedAt) {
      set({ isSyncingMessages: false });
      console.log("Skipping sync: No baseline timestamp yet.");
      httpReport = {
        success: false,
        message: "No sync baseline established yet",
      };
      return httpReport;
    }

    try {
      const response = await apiFetch<ApiResponse<MessageDto[]>>(
        `/api/messages/sync?since=${lastSyncedAt}`,
      );

      const messageArray = response.data;

      // if array in not empty
      if (Array.isArray(messageArray) && messageArray.length > 0) {
        // loop the addmessage
        const addMessage = get().addMessage;
        messageArray.forEach((msg) => {
          addMessage(msg.conversationId, msg);
        });
      }
      httpReport = { success: true, message: "Synced successfully" };
    } catch (error) {
      // handle all the thrown errors by apiFetch.

      if (isApiResponse(error)) {
        if (error.error?.code === "NO_ACTIVE_SESSION") {
          const basePath = hasRedirectTo(error.data)
            ? error.data.redirectTo
            : "/login";
          const url = new URL(basePath, window.location.origin);
          url.searchParams.set("reason", "session_expired");

          get().disconnect();

          window.location.href = url.toString();
        }

        set({ messageError: error.message });
      }
      if (error instanceof Error) {
        set({ messageError: error.message });
      }
      httpReport = { success: false, message: "HTTP Sync failed" };
    } finally {
      set({ isSyncingMessages: false });
    }

    // Check the Pulse: socket.send(PING). Start a 2-second timer.
    // The Verdict: If PONG arrives -> Do nothing (Socket is healthy). If timer expires without PONG -> Call connect().

    const { status, connect, socket, disconnect } = get();
    if (socket === null || status === "disconnected" || status === "error") {
      connect(userId);
    }
    // The socket is fully open and ready for data. don't send without checking the socket is open.
    else if (socket.readyState === WebSocket.OPEN) {
      // ping the server
      socket.send(JSON.stringify({ type: "PING" }));
      const timeout = setTimeout(() => {
        console.warn("Socket Zombie detected! No PONG received.");
        disconnect();
        connect(userId);
      }, 2000);
      set({ pongTimeout: timeout });
    }
    //The socket is in the middle of CONNECTING (or CLOSING)
    else {
      console.log("Socket is currently connecting, skipping PING");
    }
    return httpReport;
  },
});

/* to do-
-change the filter on history fetch.
-create util functions for repetitive tasks- remaining for user
-util for isApiResponse- done.
-update message routes
-rework on fetchOlderMessages,unifiedSyncUtility
*/
