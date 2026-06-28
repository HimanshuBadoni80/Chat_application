"use client";

import { z } from "zod";
import { zodLogin } from "@/lib/zod/zodSchemas";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ApiResponse, isApiResponse } from "@/lib/types/api";
import apiFetch from "@/lib/fetchapi/fetchWrapper";
import { useSignUpStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { URLSearchParams } from "url";
export default function LoginForm() {
  const [error, setError] = useState<Record<string, string>>({});
  const [loader, setLoader] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const resend = useSignUpStore((state) => state.resend);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const router = useRouter();

  // to get the "from" from the url.
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const params = new URLSearchParams(); //URLSearchParams automatically handles encodeURIComponent
  if (from) params.append("from", from);

  const handleSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError({});
    setLoader(true);
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries());

    //zod validation
    const validation = zodLogin.safeParse(body);
    if (!validation.success) {
      const flattened = z.flattenError(validation.error);
      const errorBody = Object.fromEntries(
        Object.entries(flattened.fieldErrors).map(([key, value]) => [
          key,
          value?.[0] || "invalid",
        ]),
      );
      setError(errorBody);
      setLoader(false);
      return;
    }
    try {
      const targetUrl = `/api/auth/login${params.toString() ? `${params.toString()}` : ""}`;
      const result = await apiFetch<ApiResponse<{ redirectTo: string }>>(
        targetUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validation.data),
        },
      );

      if (result.success && result.data) {
        // hard refresh (forces the browser to make a brand-new request)
        window.location.href = result.data.redirectTo;
      }
    } catch (error) {
      setLoader(false);
      if (error instanceof Error) {
        setError({
          general: error.message,
        });
        return;
      }

      if (isApiResponse(error) && error?.error) {
        // handle validation error
        if (error.error.code === "VALIDATION_ERROR") {
          setError(error.error.details || { general: error.message });
        } else if (error.error.code === "INVALID_CREDENTIALS") {
          setError({ general: error.message });
        } else if (error.error.code === "USER_UNVERIFIED") {
          const email = error.error?.details?.email;
          setUnverifiedEmail(email || null);
          setError({ general: error.message });
        }
        return;
      }

      setError({ general: "An unexpected error occurred" });
    }
  };

  const resendAction = async function () {
    // send a email, then redirect the user to verify page with email, on success response
    setError({});
    setIsPending(true);
    try {
      const result = await resend(unverifiedEmail);
      if (result.success && result.data) {
        const targetUrl = `/verify-email?email==${result.data.userEmail}${params.toString() ? `&${params.toString()}` : ""}`;
        router.replace(targetUrl);
      }
    } catch (error) {
      setIsPending(false);
      if (isApiResponse(error) && error?.error) {
        const code = error.error.code;

        if (code === "ALREADY_VERIFIED") {
          // Option A: Tell them to just log in
          setError({
            general: "This account is already verified. Please try logging in.",
          });
          setUnverifiedEmail(null); // Hide the resend button
        } else if (code === "USER_NOT_FOUND") {
          setError({
            general: "No account found with this email. Please sign up.",
          });
        } else if (code === "VALIDATION_ERROR") {
          setError({ general: "Invalid email format." });
        } else {
          setError({ general: error.message || "Failed to resend email." });
        }
        return;
      }
      setError({
        general:
          error instanceof Error
            ? error.message
            : "An unexpected error occured",
      });
    }
  };
  return (
    <div className="w-full">
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
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                className="block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
              />
            </div>
            {error.email && (
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
            <div className="mt-2">
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
              />
            </div>
            {error.password && (
              <p className="mt-2 text-sm text-destructive">{error.password}</p>
            )}
          </div>
        </div>

        {error.general && !unverifiedEmail && (
          <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive">
            {error.general}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loader}
            className={`group relative flex w-full justify-center overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
              loader
                ? "opacity-70 cursor-not-allowed hover:scale-100 active:scale-100"
                : ""
            }`}
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
            {loader ? (
              <span className="flex items-center gap-2 relative z-10">
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
                Logging in...
              </span>
            ) : (
              <span className="relative z-10">Login</span>
            )}
          </button>
        </div>
      </form>

      {unverifiedEmail && (
        <div className="mt-6 rounded-lg bg-yellow-50 p-4 border border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-900/50">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {error?.general || "Account not verified."}
          </p>
          <button
            type="button"
            onClick={resendAction}
            disabled={isPending}
            className="mt-2 text-sm font-semibold text-yellow-900 dark:text-yellow-100 underline hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
          >
            {isPending
              ? "Resending..."
              : `Resend verification email to ${unverifiedEmail}`}
          </button>
        </div>
      )}

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">New user? </span>
        <Link
          href="/signup"
          className="font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
