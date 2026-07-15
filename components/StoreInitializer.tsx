"use client";

import { useChatStore } from "@/lib/store/chatStore/useChatStore";
import { useEffect, useRef } from "react";
export default function StoreInitializer({
  user,
}: {
  user: {
    _id: string;
    uid: string;
    username: string;
    email: string;
    isVerified: boolean;
  };
}) {
  const initialized = useRef(false);
  const setAuth = useChatStore((state) => state.setAuth);
  const setConversations = useChatStore((state) => state.setConversations);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;
    setAuth(user);
    void setConversations(); // loads all the conversations
  }, [setAuth, setConversations, user]);
  return null;
}

// it is a store initializer component
