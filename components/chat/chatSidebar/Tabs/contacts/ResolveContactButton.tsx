"use client";

import { useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store/chatStore/store";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { ApiResponse } from "@/lib/types/apiResponse";
import type { contactToBeResolved } from "@/lib/types/resolveContact.types";
import { ApiFetch } from "@/lib/utils/fetchWrapper";
import {
  hasSessionExpired,
  extractErrorMessage,
} from "@/lib/utils/handleStoreErrors";

export interface ResolveContactButtonProps {
  contactId: string;
  targetUserId: string;
  nickname: string;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const ResolveContactButton = forwardRef<HTMLButtonElement, ResolveContactButtonProps>(
  ({ contactId, targetUserId, nickname, onContextMenu, ...props }, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const upsertConversation = useChatStore((state) => state.upsertConversation);
  const disconnect = useChatStore((state) => state.disconnect);

  const handleResolveContact = async () => {
    setIsLoading(true);
    try {
      const response = await ApiFetch<ApiResponse<contactToBeResolved>>(
        "/api/conversations/resolve-contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetId: targetUserId }),
        },
      );

      if (response.data?.kind === "existing") {
        upsertConversation({
          kind: "full",
          conversation: response.data.conversation,
        });
        router.push(`/chat/${response.data.conversation._id}`);
      } else if (response.data?.kind === "draft") {
        router.push(`/chat/new/${contactId}`);
      }
    } catch (error) {
      if (hasSessionExpired(error, disconnect)) return;
      toast.error(extractErrorMessage(error, "Failed to resolve contact."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      onClick={handleResolveContact}
      onContextMenu={onContextMenu}
      disabled={isLoading}
      className="flex w-full items-center justify-between px-4 py-3 h-auto rounded-none border-b border-border hover:bg-muted/50 transition-colors font-normal text-base"
      {...props}
    >
      <span>{nickname}</span>
    </Button>
  );
});

ResolveContactButton.displayName = "ResolveContactButton";

export default ResolveContactButton;
