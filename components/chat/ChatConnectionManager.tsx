"use client";
import { useChatConnection } from "@/hooks/useChatConnection";
import { useFreshData } from "@/hooks/useFreshData";
//Invisible Client Wrapper" (or Logic Component).
export default function ChatConnectionManager() {
  useChatConnection();
  useFreshData();
  return null;
}
