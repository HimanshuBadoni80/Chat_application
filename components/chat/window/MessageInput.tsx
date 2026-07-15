import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { useChatStore } from "@/lib/store/chatStore/useChatStore";
import { Button } from "@/components/ui/button";

export default function MessageInput({
  conversationId,
}: {
  conversationId: string;
}) {
  const [inputContent, setInputContent] = useState("");
  const sendMessage = useChatStore((state) => state.sendMessage);
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const text = inputContent;
    // clean the state
    setInputContent("");
    await sendMessage(conversationId, text);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-4 pt-10 bg-linear-to-t from-background via-background/90 to-transparent">
      <form
        className="pointer-events-auto mx-auto flex w-full max-w-4xl items-center gap-2 rounded-xl border border-border bg-card/95 p-2 shadow-lg shadow-black/10 backdrop-blur"
        onSubmit={handleSend}
      >
        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="Type a message..."
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!inputContent.trim()}
          aria-label="Send message"
          className="size-10 rounded-lg"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
