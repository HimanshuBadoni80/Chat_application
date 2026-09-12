
"use client";
import { useEffect, useMemo } from "react";
import MessageStream from "./MessageStream";
import MessageInput from "./MessageInput";
import ContactNotFound from "./ContactNotFound";
import { useChatStore } from "@/lib/store/chatStore/store";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ChatWindow({
  conversationId,
}: {
  conversationId: string;
}) {
  const currentUserId = useChatStore((state) => state.user?._id);
  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );
  const contactLookup = useChatStore((state) => state.contactLookup);
  const conversations = useChatStore((state) => state.conversations);

  const isTyping = useChatStore(
    (state) => state.typingStatuses[conversationId],
  );

  const contactData = useMemo(() => {
    if (!currentUserId) return null;
    const currentConversation = conversations.find(
      (conv) => conv._id === conversationId,
    );
    if (!currentConversation) return null;

    const otherUser = currentConversation.participants.find(
      (p) => p.user?.uid !== useChatStore.getState().user?.uid,
    );
    const targetUserId = otherUser?._id || "";
    const isDeleted = otherUser?.user === null;
    const nickname = contactLookup.get(targetUserId);

    let contactName = "Unknown user";
    if (nickname) {
      contactName = nickname;
    } else if (isDeleted) {
      contactName = "Deleted user";
    } else if (otherUser?.user?.username) {
      contactName = otherUser.user.username;
    }

    return {
      targetUserId,
      uid: otherUser?.user?.uid,
      contactName,
      isDeleted,
    };
  }, [conversationId, conversations, currentUserId, contactLookup]);

  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId, setActiveConversationId]);

  if (!contactData) return <ContactNotFound />;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      {/* the header */}
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
              {contactData.contactName}
            </h2>
            {contactData.isDeleted && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Deleted account
              </Badge>
            )}
          </div>
          {isTyping ? (
            <p className="text-sm text-primary font-medium italic">Typing...</p>
          ) : contactData.uid ? (
            <p className="text-sm text-muted-foreground truncate">
              {contactData.uid}
            </p>
          ) : null}
        </div>
      </div>

      {/* message stream */}
      <MessageStream conversationId={conversationId} />

      {contactData.isDeleted ? (
        <div className="p-4 border-t border-border bg-muted/30 text-center text-sm text-muted-foreground italic">
          This user&apos;s account has been deleted. You cannot send new
          messages.
        </div>
      ) : (
        <MessageInput
          id={conversationId}
          receiverId={contactData.targetUserId}
        />
      )}
    </div>
  );
}
