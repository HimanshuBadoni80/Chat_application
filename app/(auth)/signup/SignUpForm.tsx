"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUpStore } from "@/lib/store";
import { Eye, EyeOff } from "lucide-react";

export default function SingUpForm() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const email = useSignUpStore((state) => state.email);
  const status = useSignUpStore((state) => state.status);
  const error = useSignUpStore((state) => state.error);
  const setEmail = useSignUpStore((state) => state.setEmail);
  const signUp = useSignUpStore((state) => state.signUp);
  const resetForm = useSignUpStore((state) => state.resetForm);

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await signUp(password);
  };
  // navigate to verify page
  useEffect(() => {
    if (status === "success") {
      router.push(`verify-email?email=${email}`);
      resetForm();
    }
  }, [status, email, router, resetForm]);
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground"
          >
            Email address
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value.trim())}
              className="block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
            />
          </div>
          {error?.email && (
            <p className="mt-2 text-sm text-destructive">{error.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value.trim())}
              className="block w-full rounded-xl border border-input bg-background py-3 pl-4 pr-12 text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Eye className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {error?.password && (
            <p className="mt-2 text-sm text-destructive">{error.password}</p>
          )}
          <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Password must be:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "12-128 chars",
                "Uppercase",
                "Lowercase",
                "Number",
                "Symbol",
                "No spaces",
              ].map((rule) => (
                <span
                  key={rule}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-background border border-border/60 text-xs text-muted-foreground"
                >
                  {rule}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error?.general && (
        <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive">
          {error.general}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className={`group relative flex w-full justify-center overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
            status === "submitting"
              ? "opacity-70 cursor-not-allowed hover:scale-100 active:scale-100"
              : ""
          }`}
        >
          <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
          {status === "submitting" ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 animate-spin text-primary-foreground"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing up...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </form>
  );
}
