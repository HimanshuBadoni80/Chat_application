"use client";

import { useChatStore } from "@/lib/store/chatStore/store";
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
  const fetchConversations = useChatStore((state) => state.fetchConversations);
  const fetchContacts = useChatStore((state) => state.fetchContacts);
  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;
    setAuth(user);
    void fetchConversations(); // loads all the conversations
    void fetchContacts();
  }, [setAuth, fetchConversations, user, fetchContacts]);
  return null;
}

// it is a store initializer component
