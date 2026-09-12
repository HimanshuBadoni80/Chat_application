"use client";

import { useState } from "react";
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

export default function DeleteContactDialog({
  contactId,
}: {
  contactId: string | null;
}) {
  const { closeDeleteContact } = useChatUi();
  const removeContactLocally = useChatStore((state) => state.removeContactLocally);
  const disconnect = useChatStore((state) => state.disconnect);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOpen = contactId !== null;

  const handleDelete = async () => {
    if (!contactId) return;

    setIsDeleting(true);
    try {
      await ApiFetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      removeContactLocally(contactId);
      closeDeleteContact();
      toast.success("Contact deleted");
    } catch (error) {
      if (hasSessionExpired(error, disconnect)) return;
      toast.error(extractErrorMessage(error, "Failed to delete contact."));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && closeDeleteContact()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete contact?</AlertDialogTitle>
          <AlertDialogDescription>
            This contact will be removed from your list. Your conversation history will not be affected.
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
