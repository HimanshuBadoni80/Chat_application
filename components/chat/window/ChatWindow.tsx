// get the conversationId from the url and search the contact in the conversation list
// display a block
// with avatar and contact name(username) (justify left) , sharableId (justify-right)
// pass the convestionId to MessageStream.tsx

"use client";
import { useEffect } from "react";
import MessageStream from "./MessageStream";
import MessageInput from "./MessageInput";
import ContactNotFound from "./ContactNotFound";
import { useChatStore } from "@/lib/useChatStore";

export default function ChatWindow({
  conversationId,
}: {
  conversationId: string;
}) {
  // get the contact name from the conversations
  const currentUserId = useChatStore((state) => state.user?._id);
  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );
  const contact = useChatStore((state) => {
    if (!currentUserId) return null;

    const currentConversation = state.conversations.find(
      (conv) => conv._id === conversationId,
    );
    // conversation not present return early
    if (!currentConversation) return null;

    const otherUser = currentConversation.participants.find(
      (user) => user._id !== currentUserId,
    );

    return otherUser ?? null;
  });

  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId, setActiveConversationId]);

  if (!contact) return <ContactNotFound />;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      {/* the header */}
      <div className="flex flex-col items-center gap-2 p-4 border-b border-border bg-card">
        <h2 className="text-lg font-semibold">{contact.username}</h2>
        <p className="text-sm text-foreground text-left ">{contact.uid}</p>
      </div>
      {/* message stream */}
      <MessageStream conversationId={conversationId} />
      <MessageInput conversationId={conversationId} />
    </div>
  );
}
