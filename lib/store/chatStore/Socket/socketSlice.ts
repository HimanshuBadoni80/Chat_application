import { StateCreator } from "zustand";
import { socketSlice } from "./socket.types";
import { ChatStore } from "../store";
import { SocketMessageSchema } from "@/lib/validation/message.schema";

export const createSocketSlice: StateCreator<ChatStore, [], [], socketSlice> = (
  set,
  get,
) => ({
  socket: null,
  status: "idle",
  isIdentified: false, // used in useTypingEmitter.ts and emitOnline.ts
  identifyTimeout: null,
  pongTimeout: null,
  reconnectTimeout: null,
  retryCount: 0,
  socketError: null,
  typingStatuses: {},
  typingTimers: {},

  connect: (userId: string) => {
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
      if (get().socket !== ws) {
        //  "I'm ws1, but the store says ws2 is the current socket. I'm stale."
        // A dead socket's async callback firing after a new socket has already replaced it
        ws.close(1000);
        return;
      }
      set({
        status: "connected",
        retryCount: 0,
        socketError: null,
        isIdentified: false,
      });
      // identify
      ws.send(JSON.stringify({ type: "IDENTIFY", userId }));

      const identifyTimeout = setTimeout(() => {
        if (!get().isIdentified) {
          console.warn("IDENTIFY not acknowledged. Reconnecting...");
          get().disconnect();
          get().connect(userId);
        }
      }, 5000);
      set({ identifyTimeout });
    };

    ws.onmessage = (event) => {
      get().handleIncomingMessage(event.data, ws);
    };

    ws.onclose = (event) => {
      // triggers when clients and server connection dies or there is a network issue
      // if network issue, then try to reconnect with a message to user
      // if its the user, then close the connection.

      // If disconnect() already cleared the socket, this is a stale event
      if (get().socket !== ws) {
        return;
      }

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
      set({ status: "error", socketError: "connection error" });
      //onerror is followed by the onclose, so onclose handles the reconnect
    };

    set({ socket: ws });
  },
  disconnect: () => {
    //tiggers the onclose event on socket
    const { socket, reconnectTimeout, pongTimeout } = get();
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (pongTimeout) clearTimeout(pongTimeout);

    set({
      socket: null,
      status: "idle",
      isIdentified: false,
      pongTimeout: null,
      retryCount: 0,
    });

    socket?.close(1000); // normal - closure. it operates asynchronously. Only after  asynchronous background process finishes will the readyState change to 3 (CLOSED) and the onclose event will fire.
  },
  handleIncomingMessage: (data, ws) => {
    try {
      // parse into json
      const message = JSON.parse(data);
      // validate the data
      const validation = SocketMessageSchema.safeParse(message);

      if (!validation.success) {
        console.warn(`Dropped invalid ws message:${validation.error.issues}`);
        return;
      }

      const validated = validation.data;

      switch (validated.type) {
        case "IDENTIFIED":
          if (get().identifyTimeout) {
            clearTimeout(get().identifyTimeout!);
          }
          set({ isIdentified: true, identifyTimeout: null });
          break;
        case "NEW_CONVERSATION_MESSAGE": {
          const { payload: newConvPayload } = validated;

          const contactId = newConvPayload.message.senderId;
          const draftKey = `draft:${contactId}`;

          // move the draft message and draft input to new conversation
          set((state) => {
            const msgs = { ...state.messages };
            const draftMsg = msgs[draftKey];
            const draftInputs = { ...state.draftInputs };
            const draftInputObj = draftInputs[contactId];
            if (draftMsg) {
              delete msgs[draftKey];
              msgs[newConvPayload.conversation._id] = [...draftMsg];
            }

            if (draftInputObj) {
              delete draftInputs[contactId];
              draftInputs[newConvPayload.conversation._id] = draftInputObj;
            }

            return { messages: msgs, draftInputs: draftInputs };
          });

          get().upsertConversation({
            kind: "full",
            conversation: newConvPayload.conversation,
          });
          get().addMessage(
            newConvPayload.message.conversationId,
            newConvPayload.message,
          );
          break;
        }
        case "NEW_MESSAGE":
          // push it in messages record
          // how?
          const { payload: msgPayload } = validated;
          get().addMessage(msgPayload.conversationId, msgPayload);
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
        case "TYPING_INDICATOR":
          const { conversationId, typingStatus: status } = validated;

          // clear the existing timer
          const existingtimer = get().typingTimers[conversationId];
          if (existingtimer) clearTimeout(existingtimer);

          if (status === "start") {
            const updatedStatuses = {
              ...get().typingStatuses,
              [conversationId]: true,
            };
            // set the new timer
            const newTimeout = setTimeout(() => {
              set((state) => {
                const updatedStatuses = {
                  ...state.typingStatuses,
                  [conversationId]: false,
                };
                return {
                  typingStatuses: updatedStatuses,
                };
              });
            }, 5000);

            get().typingTimers[conversationId] = newTimeout;
            set({
              typingStatuses: updatedStatuses,
            });
          } else {
            const updatedStatuses = {
              ...get().typingStatuses,
              [conversationId]: false,
            };
            set({
              typingStatuses: updatedStatuses,
            });
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Malformed Socket JSON:", error);
    }
  },
});
