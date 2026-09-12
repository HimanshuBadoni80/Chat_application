"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store/chatStore/store";
import { useChatUi } from "../chatUiProvider";
import { ApiFetch } from "@/lib/utils/fetchWrapper";
import { hasSessionExpired, extractErrorMessage } from "@/lib/utils/handleStoreErrors";
import toast from "react-hot-toast";

export default function DeleteConversationDialog({
  conversationId,
}: {
  conversationId: string | null;
}) {
  const { closeDeleteConversation } = useChatUi();
  const removeConversationLocally = useChatStore((state) => state.removeConversationLocally);
  const disconnect = useChatStore((state) => state.disconnect);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = conversationId !== null;

  const handleDelete = async () => {
    if (!conversationId) return;

    setIsDeleting(true);
    try {
      await ApiFetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });

      removeConversationLocally(conversationId);
      closeDeleteConversation();
      toast.success("Conversation deleted");

      // Navigate away if the user is currently viewing this conversation
      if (pathname === `/chat/${conversationId}`) {
        router.push("/chat");
      }
    } catch (error) {
      if (hasSessionExpired(error, disconnect)) return;
      toast.error(extractErrorMessage(error, "Failed to delete conversation."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeDeleteConversation()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            This conversation will be removed from your chat list. The other person can still see it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
