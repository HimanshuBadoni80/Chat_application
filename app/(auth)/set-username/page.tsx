import SetUserNameForm from "./setUsernameForm";
import GetSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function SetUserName() {
  // GetSession checks the cookie and database asynchronously. A temporary
  // lookup failure is different from a missing or expired session.
  let session;
  try {
    session = await GetSession();
  } catch (error) {
    console.error("Set-username session lookup failed:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary/30">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/20 blur-[100px]" />

        <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-destructive">
            Unable to verify your session
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Please try again. Your account information has not been changed.
          </p>
          <div className="mt-6">
            <a 
              href="/set-username" 
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Try again
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Only a signed-in user may set a username.
  if (!session) {
    redirect("/login?from=/set-username&reason=expired");
  }

  // The persisted session is the source of truth. This also handles refreshes
  // after success and direct visits to /set-username.
  if (session.user.username) {
    redirect("/chat");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary/30">
      {/* Ambient background blur/gradient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/20 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Suspense fallback={
          <div className="h-32 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        }>
          <SetUserNameForm />
        </Suspense>
      </div>
    </div>
  );
}
