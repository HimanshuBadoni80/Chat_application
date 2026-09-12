import { FormEvent, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useChatStore } from "@/lib/store/chatStore/store";
import { Button } from "@/components/ui/button";
import { useTypingEmitter } from "@/hooks/useTypingEmitter";
export default function MessageInput({
  id,
  receiverId,
  isDraft = false,
  disabled = false,
}: {
  id: string; // can be conversationId or contactId
  receiverId: string;
  isDraft?: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const socket = useChatStore((state) => state.socket);
  const isIdentified = useChatStore((state) => state.isIdentified);

  const { onKeyStroke, stopTyping } = useTypingEmitter(
    id,
    receiverId,
    socket!,
    isIdentified,
  );

  useEffect(() => {
    const node = inputRef.current;
    // 1. Mount: Populate from Zustand and clear it globally
    if (node) {
      const existingDraft = useChatStore.getState().draftInputs[id];
      if (existingDraft && existingDraft.text) {
        node.value = existingDraft.text;
      }
    }
    useChatStore.getState().setDraftInput(id, null);

    // 2. Unmount: Save the current text to Zustand if it exists
    return () => {
      const text = node?.value.trim();
      if (text) {
        useChatStore.getState().setDraftInput(id, {
          text,
          createdAt: new Date().toISOString(),
        });
      }
    };
  }, [id]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputRef.current || disabled) return;

    const text = inputRef.current.value.trim();
    if (!text) return;

    // Clear the input instantly
    inputRef.current.value = "";

    if (isDraft) {
      await useChatStore.getState().sendFirstMessage(id, text);
    } else {
      stopTyping();
      await useChatStore.getState().sendMessage(id, text);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 pt-10 bg-linear-to-t from-background via-background/90 to-transparent">
      <form
        className="pointer-events-auto mx-auto flex w-full max-w-4xl items-center gap-2 rounded-xl border border-border bg-card/95 p-2 shadow-lg shadow-black/10 backdrop-blur"
        onSubmit={handleSend}
      >
        <input
          ref={inputRef}
          type="text"
          onInput={onKeyStroke}
          placeholder="Type a message..."
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted disabled:opacity-50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled}
          aria-label="Send message"
          className="size-10 rounded-lg"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
