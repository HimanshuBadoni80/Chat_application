import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Success({ redirectTo }: { redirectTo: string }) {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  useEffect(() => {
    if (countdown === 0) {
      // hard refresh
      window.location.href = redirectTo;
    }
  }, [countdown, router, redirectTo]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary/30">
      {/* Ambient background blur/gradient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Success Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 mb-4 ring-8 ring-emerald-500/5 animate-in zoom-in duration-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Verification Successful!
          </h2>
          <p className="text-sm text-muted-foreground">
            Your email has been verified. You can now access your account.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl bg-primary/5 p-4 border border-primary/10 text-center flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
              <svg className="h-4 w-4 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {countdown > 0 ? (
                <span>Redirecting in <span className="text-primary font-bold">{countdown}s</span>...</span>
              ) : (
                <span>Taking you to your destination...</span>
              )}
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
            Not redirecting?{" "}
            <Link href={redirectTo} className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
              Click here to continue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
