"use client"
import type { receivedData } from "./setUsernameForm";
import { useRouter } from "next/navigation";

export default function Success({ data }: { data: receivedData }) {
  const router = useRouter();
  return (
    <div className="mt-2 flex flex-col items-center animate-in zoom-in-95 duration-500">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 ring-1 ring-green-500/30 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">Success!</h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Your profile is ready to go.
      </p>

      <div className="w-full rounded-2xl border border-border/50 bg-background/50 p-4 mb-6 shadow-sm backdrop-blur-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Username</span>
            <span className="font-semibold text-foreground">@{data.username}</span>
          </div>
          <div className="h-px w-full bg-border/50"></div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">User ID</span>
            <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">{data.uid}</span>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mb-6">
        Share your User ID with friends so they can easily find you.
      </p>

      <button 
        type="button"
        onClick={() => router.replace(data.redirectTo)}
        className="group relative flex w-full justify-center overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
        <span className="relative z-10 flex items-center gap-2">
          Go to Chat
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </button>
    </div>
  );
}
