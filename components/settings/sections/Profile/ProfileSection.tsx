"use client";
import { useChatStore } from "../../../../lib/store/chatStore/useChatStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CopyToClipboardButton } from "./CopyToClipboardButton";

export function ProfileSection() {
  const router = useRouter();
  const user = useChatStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const uid = user.uid;
  const username = user.username;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary ring-1 ring-primary/20 shadow-inner">
          {username?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">@{username}</h3>
          <p className="text-sm text-muted-foreground">
            Your Profile Information
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-background/50 p-5 shadow-sm backdrop-blur-sm space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-1">
            Username
          </label>
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-3.5 shadow-sm transition-colors hover:border-primary/20 hover:bg-primary/5">
            <span className="font-medium text-foreground">@{username}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider pl-1">
            User ID
          </label>
          <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card p-2.5 pl-3.5 shadow-sm transition-colors hover:border-primary/20 hover:bg-primary/5 gap-3">
            <span className="font-mono text-sm text-primary bg-primary/10 px-2 py-1 rounded-md overflow-hidden text-ellipsis whitespace-nowrap">
              {uid}
            </span>
            <CopyToClipboardButton textToCopy={uid} />
          </div>
        </div>
      </div>
    </div>
  );
}
