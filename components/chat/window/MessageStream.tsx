import { useChatStore } from "@/lib/useChatStore";
import { useEffect, useRef, useState } from "react";

export function MessageStream(conversationId: string) {
  const messages = useChatStore(
    (state) => state.messages[conversationId] || [],
  );
  const currentUserId = useChatStore((state) => state.user?._id);

  // main container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // invisible anchor at the end of all the messages
  const messaagesEndRef = useRef<HTMLDivElement>(null);

  const [isScrolledUp, setIsScrolledUp] = useState(false);

  function handleScroll() {
    const container = scrollContainerRef.current;
    if (!container) return false;
    const { scrollHeight, scrollTop, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const isNearToBottom = distanceToBottom < 50;
    setIsScrolledUp(!isNearToBottom);
  }

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]; // latest message, also checks for empty array
    if (!lastMessage) return;
    if (!currentUserId) return;
    
    const isMyMessage = lastMessage.senderId === currentUserId;

    if (!isScrolledUp || isMyMessage) {
      messaagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messaagesEndRef, isScrolledUp, currentUserId]);

  useEffect(() => {
    messaagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [conversationId]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto flex flex-col gap-2 "
    >
      {/* render all the messages */}
    </div>
  );
}
