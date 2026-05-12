import type { ConversationPreview } from "./ConversationList";
import { Button } from "@/components/ui/button";
import { Clock, Check, CheckCheck } from "lucide-react";

function MessageStatus({ status }: { status: ConversationPreview["status"] }) {
  if (!status) return null;
  return (
    <span className="flex items-center">
      {status === "pending" && <Clock className="h-3 w-3 text-muted" />}

      {status === "sent" && <Check className="h-3 w-3 text-muted" />}

      {status === "delivered" && <CheckCheck className="h-3 w-3 text-muted" />}

      {status === "read" && <CheckCheck className="h-3 w-3 text-primary-500" />}
    </span>
  );
}
export default function ConversationItem({
  chatItem,
}: {
  chatItem: ConversationPreview;
}) {
  // Main container acting as a clickable row
  const dummyData: ConversationPreview = {
    id: "1",
    avatar: "JD",
    contactName: "John Doe",
    content: "Hey, how are you doing today?",
    createdAt: new Date().toISOString(),
    status: "read",
  };

  return (
    <Button
      variant="ghost"
      className="w-full px-3 py-3 h-auto flex items-center justify-start gap-3 cursor-pointer rounded-none border-0 border-b border-border"
    >
      {/* Avatar Section: Fixed size circle. 'shrink-0' prevents it from squishing when text is long. */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-medium">
        {dummyData.avatar}
      </div>
      {/* Message Details Section: 'flex-1' takes up remaining space. 'overflow-hidden' ensures long text truncates properly. */}
      <div className="flex flex-col flex-1 items-start overflow-hidden">
        {/* Top Row: Contact Name and Timestamp */}
        <div className="flex w-full justify-between items-center mb-1">
          <span className="font-semibold truncate">
            {dummyData.contactName}
          </span>
          <span className="text-xs text-muted shrink-0">
            {new Date(dummyData.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {/* Bottom Row: Last Message Content */}
        <div className="flex w-full justify-between items-center">
          <span className="text-sm text-muted-foreground truncate w-full text-left">
            {dummyData.content}
          </span>
          <MessageStatus status={dummyData.status} />
        </div>
      </div>
    </Button>
  );
}
