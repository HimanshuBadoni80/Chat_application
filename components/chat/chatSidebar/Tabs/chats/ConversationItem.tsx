"use client";
import { useRouter } from "next/navigation";
import { useChatUi } from "../../../chatUiProvider";
import type { ConversationItemData } from "@/lib/store/chatStore/Conversation/conversaiton.types";
import { Button } from "@/components/ui/button";
import { Clock, Check, CheckCheck } from "lucide-react";
import { useChatStore } from "@/lib/store/chatStore/store";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function MessageStatus({ status }: { status: ConversationItemData["status"] }) {
  if (!status) return null;
  return (
    <span className="flex items-center">
      {status === "pending" && <Clock className="h-3 w-3 text-muted" />}
      {status === "sent" && <Check className="h-3 w-3 text-muted" />}
      {status === "delivered" && <CheckCheck className="h-3 w-3 text-muted" />}
      {status === "read" && <CheckCheck className="h-3 w-3 text-primary-500" />}
      {status === "failed" && (
        <span className="h-3 w-3 text-destructive rounded-full bg-destructive/20 inline-block">
          !
        </span>
      )}
    </span>
  );
}

export default function ConversationItem({
  conversation,
  isActive,
}: {
  conversation: ConversationItemData;
  isActive: boolean;
}) {
  const isTyping = useChatStore(
    (state) => state.typingStatuses[conversation.id],
  );

  const router = useRouter();

  const { openDeleteConversation } = useChatUi();

  const handleRouting = () => {
    router.push(`/chat/${conversation.id}`);
  };

  const formattedTime = conversation.createdAt
    ? new Date(conversation.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Button
          onClick={handleRouting}
          variant="ghost"
          className={`w-full px-3 py-3 h-auto flex items-center justify-start gap-3 cursor-pointer rounded-none border-b border-border hover:bg-muted/50 transition-colors ${
            isActive ? "bg-muted" : ""
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-medium">
            {conversation.avatarInitials}
          </div>
          <div className="flex flex-col flex-1 items-start overflow-hidden">
            <div className="flex w-full justify-between items-center mb-1">
              <span
                className={`font-semibold truncate ${conversation.isDeleted ? "text-muted-foreground line-through opacity-70" : ""}`}
              >
                {conversation.contactName}
              </span>
              {formattedTime && (
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {formattedTime}
                </span>
              )}
            </div>
            <div className="flex w-full justify-between items-center gap-2">
              <span className="text-sm text-muted-foreground truncate w-full text-left">
                {isTyping && !isActive ? (
                  <span className="text-primary font-medium italic">
                    Typing...
                  </span>
                ) : conversation.isDraft ? (
                  <span className="text-primary font-medium mr-1">Draft:</span>
                ) : null}

                {(!isTyping || (isTyping && isActive)) &&
                  (conversation.content || (
                    <span className="italic">No messages yet</span>
                  ))}
              </span>
              <MessageStatus status={conversation.status} />
            </div>
          </div>
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => openDeleteConversation(conversation.id)}
          className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
        >
          Delete conversation
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
