export default function VerifyLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary/30">
      {/* Ambient background blur/gradient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/20 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Loader Graphic */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4 ring-8 ring-primary/5 relative">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl animate-pulse">
            Verifying...
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Please wait while we securely verify your email address. This should only take a moment.
          </p>
        </div>
      </div>
    </div>
  );
}
