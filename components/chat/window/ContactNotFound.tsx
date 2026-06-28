import Link from "next/link";

export default function ContactNotFound() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-background/50 p-8 text-center animate-in fade-in duration-500 overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted/30 blur-[120px]" />

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {/* Error/Missing State Graphic */}
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 ring-8 ring-muted/20 animate-in zoom-in duration-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Contact Not Found
        </h2>

        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          The conversation or the user on the other end does not exist or has been removed.
        </p>

        {/* Action button to return to home */}
        <div className="mt-8">
          <Link
            href="/chat"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
            <span className="flex items-center gap-2 relative z-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to messages
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}