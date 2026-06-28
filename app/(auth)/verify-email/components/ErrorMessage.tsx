import Link from "next/link";
import { ApiResponse } from "@/lib/types/api";
import { PageStatus } from "../page";
import { useState, useEffect } from "react";
import { useSearchParams,useRouter } from "next/navigation";
interface ErrorMessageProps {
  errorMessage: string;
  resend: (email:string | null) => Promise<ApiResponse<{userEmail:string}>>;
  setStatus: (status: PageStatus) => void;
  setErrorMessage: (errMessage: string) => void;
}
export default function ErrorMessage({
  errorMessage,
  resend,
  setStatus,
  setErrorMessage,
}: ErrorMessageProps) {
  const [countdown, setCountdown] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email");
  const [userNotFound, setIsUserNotFound] = useState(false);
  const handleResend = async () => {
    setErrorMessage("");
    // set the countdown value
    if (countdown > 0) return;
    setIsPending(true);
    try {
      await resend(urlEmail);
      setCountdown(60);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      // a pop up message that email has been sent
    } catch (error) {
      setCountdown(0);
      if (error && typeof error === "object" && "error" in error) {
        const apiError = error as ApiResponse;
        if (apiError?.error?.code === "ALREADY_VERIFIED") {
          router.push("/login");
        } else if(apiError?.error?.code === "USER_NOT_FOUND"){
          setErrorMessage(apiError.message);
          setIsUserNotFound(true);
          setStatus("error");
        } else {
          setErrorMessage(apiError.message);
          setStatus("error");
        }
        return;
      }

      if (error instanceof Error) {
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }
      setErrorMessage("an unexpected error occurred");
      setStatus("error");
    } finally {
      setIsPending(false);
    }
  };
  useEffect(() => {
      if (countdown > 0) {
        const timer = setInterval(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
        return () => {
          clearInterval(timer);
        };
      }
    }, [countdown]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary/30">
      {/* Ambient background blur/gradient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/20 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Error Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-4 ring-8 ring-destructive/5 animate-in zoom-in duration-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Verification Failed
          </h2>
          {errorMessage && (
            <div className="mx-auto max-w-[90%] rounded-lg bg-destructive/10 p-3 border border-destructive/20 text-sm font-medium text-destructive">
            {errorMessage}
          </div>
          )}
          
        </div>

        <div className="mt-8 space-y-6">
          <div className="flex flex-col gap-3">
            {userNotFound ? (
              <Link href="/signup" className="group relative flex w-full justify-center overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
                <span className="relative z-10">Create a new account</span>
              </Link>
            ) : (
              <button
                onClick={handleResend}
                disabled={isPending || countdown > 0}
                className={`group relative flex w-full justify-center overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  (isPending || countdown > 0) ? "opacity-70 cursor-not-allowed hover:scale-100 active:scale-100" : ""
                }`}
              >
                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
                <span className="flex items-center gap-2 relative z-10">
                  {isPending && (
                    <svg className="h-5 w-5 animate-spin text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isPending
                    ? "Sending..."
                    : countdown > 0
                    ? `Wait ${countdown}s to resend`
                    : "Resend verification email"}
                </span>
              </button>
            )}

            {success && (
              <div className="rounded-lg bg-emerald-500/10 p-3 border border-emerald-500/20 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400 animate-in fade-in zoom-in duration-300">
                Email has been sent successfully!
              </div>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border/50">
            Entered the wrong email?{" "}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
              Go back to sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
