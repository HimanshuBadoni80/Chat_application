"use client";
import { useChatConnection } from "@/hooks/chat/useChatConnection";

//Invisible Client Wrapper" (or Logic Component).
export default function ChatConnectionManager() {
  useChatConnection();
  return null;
}
