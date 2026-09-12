import { Clock, Check, CheckCheck, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageStatus = "pending" | "failed" | "sent" | "delivered" | "read";

interface MessageBubbleProps {
  content: string;
  isSentByMe: boolean;
  status?: MessageStatus;
  createdAt: string;
  onRetry?: () => void;
}

function StatusIcon({ status = "sent" }: { status?: MessageStatus }) {
  const iconClassName = cn(
    "h-3.5 w-3.5 shrink-0",
    status === "read" ? "text-sky-200" : "text-white/70",
  );

  if (status === "failed") {
    return <AlertCircle aria-label="Failed" className={cn(iconClassName, "text-destructive-foreground")} />;
  }

  if (status === "pending") {
    return (
      <Clock
        aria-label="Pending"
        className={iconClassName}
      />
    );
  }

  if (status === "sent") {
    return <Check aria-label="Sent" className={iconClassName} />;
  }

  return (
    <CheckCheck
      aria-label={status === "read" ? "Read" : "Delivered"}
      className={iconClassName}
    />
  );
}

function MessageTime({ createdAt }: { createdAt: string }) {
  return (
    <span>
      {new Date(createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  );
}

export default function MessageBubble({
  content,
  isSentByMe,
  status = "sent",
  createdAt,
  onRetry,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex w-full",
        isSentByMe ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "relative max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[68%]",
          "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          isSentByMe
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-card text-foreground",
          status === "failed" && "bg-destructive/90 text-destructive-foreground"
        )}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {content}
        </p>

        <div
          className={cn(
            "mt-1.5 flex items-center gap-1 text-[0.625rem] leading-none",
            isSentByMe ? "justify-end text-primary-foreground/70" : "text-muted",
          )}
        >
          <MessageTime createdAt={createdAt} />
          {isSentByMe && <StatusIcon status={status} />}
        </div>
      </div>
      
      {/* Retry Button */}
      {status === "failed" && onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 self-center rounded-full bg-destructive/10 p-2 text-destructive hover:bg-destructive/20 transition-colors"
          title="Retry message"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
