import { create } from "zustand";

import type {
  ContactSlice,
  AuthSlice,
  conversationSlice,
  messageSlice,
  socketSlice,
} from "./index";
import {
  createContactSlice,
  createAuthSlice,
  createConversationSlice,
  createMessageSlice,
  createSocketSlice,
} from "./index";

export interface ChatStore
  extends
    AuthSlice,
    ContactSlice,
    conversationSlice,
    messageSlice,
    socketSlice {}

export const useChatStore = create<ChatStore>((set, get, api) => ({
  ...createSocketSlice(set, get, api),
  ...createAuthSlice(set, get, api),
  ...createConversationSlice(set, get, api),
  ...createMessageSlice(set, get, api),
  ...createContactSlice(set, get, api),
}));
