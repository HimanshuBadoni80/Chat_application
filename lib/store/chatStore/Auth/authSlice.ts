import { StateCreator } from "zustand";
import type { ChatStore } from "../store";
import { AuthSlice } from "./auth.types";

export const createAuthSlice: StateCreator<
  ChatStore,
  [],
  [],
  AuthSlice
> = (set) => ({
  user: null,
  setAuth: (user) => {
    set({ user });
  },
  clearAuth: () => {
    set({ user: null });
  },
  
});


/* function hasNoUser(user:Authuser | null){
      if(!user){
        console.error("Critical; Error: tried to send message without a user");
      window.location.href = "/login";
      return true;
      }
      return false;
    } */