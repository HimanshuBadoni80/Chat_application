"use client";
import { useChatStore } from "@/lib/useChatStore";
import { useRef } from "react";
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

  if (!initialized.current) {
    useChatStore.getState().setAuth(user);
    initialized.current = true;
  }
  return null;
}

// it is a store initializer component
