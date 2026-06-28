import Link from "next/link";
import SingUpForm from "./SignUpForm";
export default function SingUp() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 selection:bg-primary/30">
      {/* Ambient background blur/gradient */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/20 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Create an account
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Join us today and experience seamless communication.
          </p>
        </div>
        
        <SingUpForm />
        
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
