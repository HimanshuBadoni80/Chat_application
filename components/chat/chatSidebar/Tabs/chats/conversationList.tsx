"use client";
import { useParams } from "next/navigation";
import { useChatStore } from "@/lib/store/chatStore/store";
import ConversationItem from "./ConversationItem";
import EmptyChatCard from "./EmptyChatCard";

export default function ConversationList({onGoToContact}:{onGoToContact:(value: "chats" | "contacts") => void}) {
  const params = useParams<{ conversationId?: string }>();
  const activeConversationId = params.conversationId;
  
  const conversationUiData = useChatStore((state) => state.conversationUiData);
  const isLoadingConversations = useChatStore((state) => state.isLoadingConversations);

  if (!isLoadingConversations && conversationUiData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <EmptyChatCard onGoToContact={onGoToContact} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      {conversationUiData.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeConversationId}
        />
      ))}
    </div>
  );
}