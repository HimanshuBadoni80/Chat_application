import type { ContactItemData } from "@/lib/store/chatStore/contact/contact.types";
import Link from "next/link";
import ResolveContactButton from "./ResolveContactButton";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatUi } from "../../../chatUiProvider";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export function ContactListItem({ contact }: { contact: ContactItemData }) {
  const { openDeleteContact } = useChatUi();

  let content;

  // Case 1: Deleted user, no conversation → only delete button
  if (contact.isDeleted && !contact.hasConversation) {
    content = (
      <div className="flex w-full items-center justify-between px-4 py-3 border-b border-border text-muted-foreground">
        <span className="font-medium text-sm">Deleted account</span>
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Delete contact"
          onClick={() => openDeleteContact(contact.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive opacity-70 hover:opacity-100" />
        </Button>
      </div>
    );
  }
  // Case 2: Deleted user, has conversation → view history (no send)
  else if (contact.isDeleted && contact.hasConversation) {
    content = (
      <Link
        href={contact.href!}
        className="flex w-full items-center justify-between px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-muted-foreground line-through opacity-70">{contact.nickname}</span>
        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
          Deleted
        </span>
      </Link>
    );
  }
  // Case 3: Active user, has conversation → link to chat
  else if (contact.href) {
    content = (
      <Link
        href={contact.href}
        className="flex w-full items-center justify-between px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium">{contact.nickname}</span>
      </Link>
    );
  }
  // Case 4: Active user, no conversation → resolve-contact button
  else {
    content = (
      <ResolveContactButton
        contactId={contact.id}
        targetUserId={contact.targetUserId}
        nickname={contact.nickname}
      />
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {content}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem 
          onClick={() => openDeleteContact(contact.id)}
          className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
        >
          Delete contact
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
