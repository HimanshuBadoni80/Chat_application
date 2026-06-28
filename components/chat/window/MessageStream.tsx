import { useChatStore } from "@/lib/useChatStore";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import { ArrowDown } from "lucide-react";
import type { IMessageBase } from "@/lib/Models";

const EMPTY_ARRAY: IMessageBase[] = []; // a stable reference as fallback
// when Zustand checks EMPTY_ARRAY === EMPTY_ARRAY,
// it evaluates to true, and the component safely ignores updates from other chats!

export default function MessageStream({
  conversationId,
}: {
  conversationId: string;
}) {
  const messages = useChatStore(
    (state) => state.messages[conversationId] || EMPTY_ARRAY,
  );

  // is the conversationId registered in the historyStateByConversation
  const hasProps = useChatStore(
    (state) => state.historyStateByConversation[conversationId],
  );
  // hasProps can be undefined.

  const { hasReachedTop, isFetchingHistory, historyError } = hasProps || {
    hasReachedTop: false,
    isFetchingHistory: false,
    historyError: null,
  };

  const currentUserId = useChatStore((state) => state.user?._id);

  const fetchOlderMessages = useChatStore((state) => state.fetchOlderMessages);

  // ref for _id || tempId
  const MsgIdRef = useRef<string | undefined>(undefined);

  // ref for disatance to bottom
  const iscloseTOBottom = useRef<boolean>(true);

  // main container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // invisible anchor at the end of all the messages
  const messaagesEndRef = useRef<HTMLDivElement>(null);

  // ref for invisible div to trigger history fetch
  const topAnchorRef = useRef<HTMLDivElement>(null);

  const [isScrolledUp, setIsScrolledUp] = useState(false);

  function handleScroll() {
    const container = scrollContainerRef.current;
    if (!container) return false;

    const { scrollHeight, scrollTop, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    const shouldShowJumpButton = distanceToBottom >= 100;
    iscloseTOBottom.current = !shouldShowJumpButton;
    setIsScrolledUp(shouldShowJumpButton);
  }

  useEffect(() => {
    const lastMsg = messages[messages.length - 1]; // latest message, also checks for empty array
    if (!lastMsg) return;

    if (!currentUserId) return;

    // lastMsg are two types from the user has tempId and from someone else has just the _id.
    // for user tempId is always there.
    const lastMsgId = lastMsg.tempId || lastMsg._id;

    if (!MsgIdRef.current || lastMsgId !== MsgIdRef.current) {
      // update the MsgIdRef
      MsgIdRef.current = lastMsgId;

      const isSentByMe = lastMsg.senderId === currentUserId;
      if (isSentByMe) {
        messaagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else if (iscloseTOBottom.current) {
        messaagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
  }, [messages, currentUserId]);

  // on the first render, scroll down
  useEffect(() => {
    messaagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    return () => {
      // resets all the refs, just not the DOM refs.
      MsgIdRef.current = undefined;
      iscloseTOBottom.current = true;
    };
  }, [conversationId]);

  useEffect(() => {
    // const getHistory = async () => {
    const observer = new IntersectionObserver(
      (entires) => {
        const firstEntry = entires[0];

        if (firstEntry.isIntersecting && !historyError) {
          fetchOlderMessages(conversationId);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 1.0,
        rootMargin: "100px 0px 0px 0px",
      },
    );
    if (topAnchorRef.current) {
      observer.observe(topAnchorRef.current);
    }

    return () => observer.disconnect();
    // };
  }, [fetchOlderMessages, conversationId, historyError]);
  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex flex-1 flex-col gap-2 overflow-y-auto p-4 pb-28"
    >
      {/* conditionally render the history fetching or history error with a refetch buttton */}
      {isFetchingHistory ? (
        <div
          aria-live="polite"
          className="rounded-md bg-muted px-3 py-2 text-center text-sm text-muted-foreground"
        >
          Fetching history...
        </div>
      ) : historyError ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <span>{historyError}</span>
          <button
            type="button"
            className="shrink-0 rounded-md border border-destructive/40 px-3 py-1 font-medium hover:bg-destructive/10 cursor-pointer"
            onClick={() => fetchOlderMessages(conversationId)}
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* history tirgger div */}
      {!hasReachedTop && <div ref={topAnchorRef} className="h-1"></div>}
      {/* render all the messages */}
      {messages.map((msg) => (
        <MessageBubble
          key={msg._id || msg.tempId}
          content={msg.content}
          isSentByMe={msg.senderId === currentUserId}
          status={msg.status}
          createdAt={msg.createdAt}
        />
      ))}
      {/* invisible anchor */}
      <div ref={messaagesEndRef} className="h-1"></div>
      {/* jump to bottom */}
      {isScrolledUp && (
        <button
          className="absolute bottom-25 right-4 bg-gray-500 border border-gray-600 text-white rounded-full p-2"
          onClick={() =>
            messaagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <ArrowDown />
        </button>
      )}
    </div>
  );
}
