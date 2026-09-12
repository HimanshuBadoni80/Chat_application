"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/lib/store/chatStore/store";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import MessageInput from "./MessageInput";
import MessageStream from "./MessageStream";
import ContactNotFound from "./ContactNotFound";

export default function DraftChatWindow({ contactId }: { contactId: string }) {
  const router = useRouter();

  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );
  const contacts = useChatStore((state) => state.contactUiData);
  const conversationLookup = useChatStore((state) => state.conversationLookup);

  const contactData = useMemo(() => {
    return contacts.find((c) => c.id === contactId);
  }, [contacts, contactId]);

  useEffect(() => {
    // Clear active conversation since this is a draft
    setActiveConversationId("");
  }, [setActiveConversationId]);

  useEffect(() => {
    // If the websocket creates the conversation (or if user shouldn't be here)
    if (contactData && contactData.targetUserId) {
      const entry = conversationLookup.get(contactData.targetUserId);
      if (entry?.conversationId) {
        // Conversation officially exists! Route them!
        router.replace(`/chat/${entry.conversationId}`);
      }
    }
  }, [conversationLookup, contactData, router]);

  if (!contactData) return <ContactNotFound />;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <Link
          href="/chat"
          className="md:hidden shrink-0 -ml-2 p-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold truncate">
              {contactData.nickname}
            </h2>
            {contactData.isDeleted && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Deleted account
              </Badge>
            )}
          </div>
          {contactData.username && (
            <p className="text-sm text-muted-foreground truncate">
              {contactData.username}
            </p>
          )}
        </div>
      </div>

      {/* Message Stream */}
      {/* 
        We pass the draft key to MessageStream. 
        It will look up messages using `draft:${contactId}` 
      */}
      <MessageStream conversationId={`draft:${contactId}`} />

      {/* Input */}
      {contactData.isDeleted ? (
        <div className="p-4 border-t border-border bg-muted/30 text-center text-sm text-muted-foreground italic">
          This user&aposs account has been deleted. You cannot send new
          messages.
        </div>
      ) : (
        <MessageInput
          id={contactId}
          receiverId={contactData.targetUserId}
          isDraft={true}
          disabled={false}
        />
      )}
    </div>
  );
}
