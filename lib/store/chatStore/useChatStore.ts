import { create } from "zustand";
import type { ContactSlice } from "./contact/contact.types";
import { createContactSlice } from "./contact/contactSlice";
import type {
  IMessageBase,
  IncomingMessage,
  IMessagePatch,
} from "../../Models/message";
import { SocketMessageSchema } from "../../zod/messages/Schemas";
import type { updatedIConversation } from "../../types/Conversation";
import apiFetch from "../../fetchapi/fetchWrapper";
import { ApiResponse, isApiResponse } from "../../types/api";
import { msgSchema } from "../../zod/messages/Schemas";
// hepler function checks for duplicate messages
const mergeAndDedupe = (
  existing: IMessageBase[],
  incoming: IncomingMessage[],
) => {
  // initiate a new map
  const map = new Map<string, IMessageBase>();

  const findKey = (msg: IncomingMessage) => {
    for (const [key, value] of map.entries()) {
      if (msg.tempId && value.tempId === msg.tempId) return key;
      if (msg._id && value._id === msg._id) return key;
    }
    return null;
  };

  // merge new and existing
  [...existing, ...incoming].forEach((msg) => {
    // check if alreay in the map
    const matchKey = findKey(msg);

    const bestId = msg._id || msg.tempId || "unknown";

    if (matchKey) {
      const existingMessage = map.get(matchKey);
      const updated = {
        ...existingMessage,
        ...msg,
      } as IMessageBase;
      if (matchKey !== bestId) {
        map.delete(matchKey);
      }
      map.set(bestId, updated);
    } else {
      // new message
      if ("content" in msg) {
        map.set(bestId, msg);
      } else {
        // msg with no content, so discard it
        console.warn("Discarded orphan message:", msg);
      }
    }
  });

  // create array from the map
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};

function hasRedirectTo(data: unknown): data is { redirectTo: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "redirectTo" in data &&
    typeof (data as { redirectTo?: unknown }).redirectTo === "string"
  );
}

interface historyProps {
  hasReachedTop: boolean;
  isFetchingHistory: boolean;
  historyError: string | null;
}
export interface ChatStore extends ContactSlice {
  user: {
    _id: string;
    uid: string;
    username: string;
    email: string;
    isVerified: boolean;
  } | null;
  // the connection state
  socket: WebSocket | null;
  status: "idle" | "connecting" | "connected" | "disconnected" | "error";
  isIdentified: boolean; // Confirms the { type: "IDENTIFY" } worked
  pongTimeout: ReturnType<typeof setTimeout> | null;
  error: string | null;
  historyError: string | null;
  // the data
  messages: Record<string, IMessageBase[]>;
  lastSyncedAt: string | null;
  isSyncingMessages: boolean;
  conversations: updatedIConversation[] | [];
  activeConversationId: string | null;

  // UI lifecycle
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  historyStateByConversation: Record<string, historyProps>;

  reconnectTimeout: ReturnType<typeof setTimeout> | null;
  retryCount: number;

  setAuth: (user: {
    _id: string;
    uid: string;
    username: string;
    email: string;
    isVerified: boolean;
  }) => void;
  // actions
  connect: (userId: string) => void;
  disconnect: () => void;

  // Logic to handle the JSON.parse from the server
  handleIncomingMessage: (data: string, ws: WebSocket) => void; // why a separate fun
  //the WebSocket onmessage event gives you a "Raw Blob" or a "String." You need a dedicated place to JSON.parse it, check the type (is it a PONG? is it a NEW_MESSAGE?), and then decide which drawer to put it in.

  // Logic to update the "Drawers"
  addMessage: (conversationId: string, message: IncomingMessage) => void;
  setMessage: (conversationId: string, message: IncomingMessage[]) => void;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  fetchOlderMessages: (conversationId: string) => Promise<void>;
  setActiveConversationId: (Id: string) => void;
  setConversations: () => Promise<void>;
  bumpConvs: (
    conversationId: string,
    lastestMessage: IMessageBase,
  ) => updatedIConversation[];
  unifiedSyncUtility: (userId: string) => Promise<{
    success: boolean;
    message: string;
  }>;
}

export const useChatStore = create<ChatStore>((set, get, api) => ({
  user: null,
  socket: null,
  status: "idle",
  isIdentified: false,
  pongTimeout: null,
  error: null,
  historyError: null,
  messages: {},
  lastSyncedAt: null,
  isSyncingMessages: false,
  conversations: [],
  activeConversationId: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  historyStateByConversation: {},
  reconnectTimeout: null,
  retryCount: 0,
  setAuth: function (user: {
    _id: string;
    uid: string;
    username: string;
    email: string;
    isVerified: boolean;
  }) {
    set({ user });
  },
  connect: function (userId: string) {
    // check for existing socket
    const socket = get().socket;
    if (
      socket &&
      (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING)
    )
      return;

    // create a new connection
    set({ status: "connecting" });

    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);

    ws.onopen = () => {
      set({
        status: "connected",
        retryCount: 0,
        error: null,
        isIdentified: false,
      });
      // identify
      ws.send(JSON.stringify({ type: "IDENTIFY", userId }));
    };

    ws.onmessage = (event) => {
      get().handleIncomingMessage(event.data, ws);
    };

    ws.onclose = (event) => {
      // triggers when clients and server connection dies or there is a network issue
      // if network issue, then try to reconnect with a message to user
      // if its the user, then close the connection.

      set({ status: "disconnected", isIdentified: false });
      // if user loggedOut, means it was a clean close but if it is a network issue, then reconnect
      if (event.code !== 1000) {
        console.log("Connection lost. Retrying...");

        // call the connect function (Exponential Backoff)
        const jitter = Math.floor(Math.random() * 1000) + 1;
        const delay = Math.min(
          Math.pow(2, get().retryCount) * 1000 + jitter,
          30000,
        );
        const timeout = setTimeout(() => {
          set({ retryCount: get().retryCount + 1 });
          get().connect(userId);
        }, delay);
        set({ reconnectTimeout: timeout });
      }
    };

    ws.onerror = (error) => {
      console.log("Websocket Error occured:", error);
      set({ status: "error", error: "connection error" });
      //onerror is followed by the onclose, so onclose handles the reconnect
    };

    set({ socket: ws });
  },
  disconnect: function () {
    //tiggers the onclose event on socket
    const { socket, reconnectTimeout } = get();
    if (socket) {
      socket.close(1000); // normal - closure
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    set({ socket: null, status: "idle", isIdentified: false, retryCount: 0 });
  },
  handleIncomingMessage: function (data: string, ws: WebSocket) {
    try {
      // parse into json
      const message = JSON.parse(data);
      // validate the data
      const validation = SocketMessageSchema.safeParse(message);
      // if(!validation.success)

      // const socket = get().socket;

      switch (validation.data?.type) {
        case "NEW_MESSAGE":
          // push it in messages record
          // how?
          const { payload } = validation.data;
          get().addMessage(payload.conversationId, payload);
          break;
        case "PING":
          // send a pong message
          ws.send(JSON.stringify({ type: "PONG" }));
          break;
        case "PONG":
          // server responded
          const pongTimeout = get().pongTimeout;
          if (pongTimeout) {
            clearTimeout(pongTimeout);
            set({ pongTimeout: null });
            console.log("Socket is healthy");
          }

          break;

        // case "TYPING_INDICATOR":
        //   // show typing indicator
        // break;
        // case "MARK_DELIVERED":
        //   // show double ticks
        //   break;
        default:
          break;
      }
    } catch (error) {
      console.error("Malformed Socket JSON:", error);
    }
  },
  addMessage: function (conversationId: string, Incoming: IncomingMessage) {
    // work is to push messages in the messages record

    set((state) => {
      const existingMessages = state.messages[conversationId] || [];

      const updated = mergeAndDedupe(existingMessages, [Incoming]);
      const latest = updated.at(-1);
      // call bumpConvs
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
      }

      return {
        messages: {
          ...state.messages,
          [conversationId]: updated,
        },
      };
    });
  },
  setMessage: function (conversationId: string, message: IncomingMessage[]) {
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
  sendMessage: async function (conversationId: string, text: string) {
    const { user, addMessage } = get();

    if (!user) {
      console.error("Critica; Error: tried to send message without a user");
      window.location.href = "/login";
      return;
    }
    const tempId = crypto.randomUUID(); // native browser UUID
    // create a IMessageBase message obj
    const newMessage: IMessageBase = {
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

    // DTO for send api
    const msgForApi: msgSchema = {
      tempId,
      conversationId,
      content: text,
      messageType: "text",
    };

    try {
      // send the message
      const result = await apiFetch<IMessagePatch>(`/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(msgForApi),
      });

      addMessage(conversationId, result);
    } catch (error) {
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

        set({ error: error.message });
      }
      if (error instanceof Error) {
        set({ error: error.message });
      }
    }
  },
  fetchOlderMessages: async function (conversationId: string) {
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

    // // why check the conversation, because the setConversation() does not create an array with the id. so in the message record, the array is undefined.
    // // look for the conversation with the conversationId

    // const hasLastMessage = conversations.find(
    //   (conv) => conv._id === conversationId,
    // )?.lastMessage;
    // if (!hasLastMessage) return;

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
      const response = await apiFetch<ApiResponse<IMessageBase[]>>(
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
  setActiveConversationId: (ConversationId: string) =>
    set({ activeConversationId: ConversationId }),
  setConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const response = await apiFetch<ApiResponse<updatedIConversation[]>>(
        "/api/conversations/conversationList",
      );

      const conversations = response.data ?? [];

      // update the lastSyncedAt
      set({
        conversations,
        lastSyncedAt:
          conversations[0]?.lastMessage?.createdAt ?? new Date().toISOString(),
      });

      // push data in messages
      set((state) => {
        const seededMessages: Record<string, IMessageBase[]> = {};

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
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "an unexpected error occured",
      });
    } finally {
      set({ isLoadingConversations: false });
    }
  },
  bumpConvs: (conversationId: string, lastestMessage: IMessageBase) => {
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
  unifiedSyncUtility: async function (userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
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
      const response = await apiFetch<ApiResponse<IMessageBase[]>>(
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

        set({ error: error.message });
      }
      if (error instanceof Error) {
        set({ error: error.message });
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
  ...createContactSlice(set, get, api),
}));
