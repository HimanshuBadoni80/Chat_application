import { create } from "zustand";
import type { IMessageBase, IncomingMessage } from "./Models/message";
import { SocketMessageSchema } from "./zod/messages/Schemas";

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

interface ChatStore {
  // the connection state
  socket: WebSocket | null;
  status: "idle" | "connecting" | "connected" | "disconnected" | "error";
  isIdentified: boolean; // Confirms the { type: "IDENTIFY" } worked
  error: string | null;

  // the data
  messages: Record<string, IMessageBase[]>;
  activeConversationId: string | null;

  // UI lifecycle
  isLoadingMessages: boolean;
  reconnectTimeout: ReturnType<typeof setTimeout> | null;
  retryCount: number;
  // actions
  connect: (userId: string) => void;
  disconnect: () => void;

  // Logic to handle the JSON.parse from the server
  handleIncomingMessage: (data: string, ws: WebSocket) => void; // why a separate fun
  //the WebSocket onmessage event gives you a "Raw Blob" or a "String." You need a dedicated place to JSON.parse it, check the type (is it a PONG? is it a NEW_MESSAGE?), and then decide which drawer to put it in.

  // Logic to update the "Drawers"
  addMessage: (conversationId: string, message: IncomingMessage) => void;
  setMessage: (conversationId: string, message: IncomingMessage[]) => void;
  setActiveConversationId: (Id: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  status: "idle",
  isIdentified: false,
  error: null,
  messages: {},
  activeConversationId: null,
  isLoadingMessages: false,
  reconnectTimeout: null,
  retryCount: 0,
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

      // old logic
      // // search in the current array for a message index with tempId or _id
      // const existingIndex = currentList.findIndex(
      //   (m) =>
      //     (IncomingMessage.tempId && m.tempId === IncomingMessage.tempId) ||
      //     ("_id" in IncomingMessage && m._id === IncomingMessage._id),
      // );

      // const updatedList = [...currentList];

      // if (existingIndex !== -1) {
      //   // case 2: update the message obj
      //   const existingMessage = updatedList[existingIndex];
      //   const updatedMessage = {
      //     ...existingMessage,
      //     ...IncomingMessage,
      //   };
      //   // if ("_id" in IncomingMessage) {
      //   //   delete updatedMessage.tempId;
      //   // }
      //   updatedList[existingIndex] = updatedMessage as IMessageBase;
      // } else {
      //   // case 1 and 3
      //   if (!("content" in IncomingMessage)) return state;

      //   updatedList.push(IncomingMessage as IMessageBase);
      // }

      // // sort the array
      // updatedList.sort(
      //   (a, b) =>
      //     new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      // );

      const updated = mergeAndDedupe(existingMessages, [Incoming]);

      return {
        messages: {
          ...state.messages,
          [conversationId]: updated,
        },
      };
    });

    // case 1: for sender, get the conversationId and create a message obj with temp Id
    //  {conversationId,senderId,content,messageType,status,createdAt,tempId} and what to send to api
    // {conversationId,content,messageType,receiverId,tempId}
    //
    /* case 2: message from the http api response
      {_id: newMessage._id.tostring(),
      conversationId: newMessage.conversationId.toString(),
      senderId: newMessage.senderId.toString(),
      content: newMessage.content,
      messageType: newMessage.messageType,
      createdAt: newMessage.createdAt,
      status: "sent", 
      tempId} 
      
      update the message in the array thus updating the UI
    */

    /* case 3: when receiving  a new message, just push it in the array */
  },
  setMessage: function (conversationId: string, message: IncomingMessage[]) {
    // push the previous messages in the record
    // the conversation id is given this function from url parameters
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      // for the first time, the key with conversationId is undefined in the state so a default empty [] acts as a fallback.

      const updated = mergeAndDedupe(existingMessages, message);

      return {
        messages: {
          ...state.messages,
          [conversationId]: updated,
        },
        isLoadingMessages: false,
      };
    });
  },
  setActiveConversationId: (ConversationId: string) =>
    set({ activeConversationId: ConversationId }),
}));

/* Check for existing connection: If get().socket is already open, return (don't double-connect).

Update Status: set({ status: 'connecting' }).

Create Instance: const ws = new WebSocket(process.env.NEXT_PUBLIC_WSS_URL).

The onopen Hook: * Set status: 'connected'.

The Identity: Send ws.send(JSON.stringify({ type: 'IDENTIFY', userId })).

The onmessage Hook:

Take the raw data and pass it to get().handleIncomingMessage(data).

The onclose Hook:

If it was a clean exit (Logout), set status: 'disconnected'.

If it was a crash, set status: 'error' and trigger the Retry Timer.

The onerror Hook:

Set status: 'error' and log the issue.

Store the Socket: set({ socket: ws }). */
