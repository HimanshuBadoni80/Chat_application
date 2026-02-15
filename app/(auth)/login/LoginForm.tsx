"use client";

import { z } from "zod";
import { zodLogin } from "@/lib/zod/zodSchemas";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { ApiResponse } from "@/lib/types/api";
import apiFetch from "@/lib/fetchapi/fetchWrapper";
import { useSignUpStore } from "@/lib/store";
import { useRouter } from "next/navigation";
export default function LoginForm() {
  const [error, setError] = useState<Record<string, string>>({});
  const [loader, setLoader] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const resend = useSignUpStore((state) => state.resend);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const router = useRouter();

  // to get the "from" from the url.
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  function isApiResponse(error: unknown): error is ApiResponse<unknown> {
    return typeof error === "object" && error !== null && "success" in error;
  }
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
      const result = await apiFetch<ApiResponse<{ redirectTo: string }>>(
        `api/auth/login?from=${encodeURIComponent(from)}`,
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
        router.replace(
          `/verify-email?email=${result.data.userEmail}&from=${encodeURIComponent(from)}`,
        );
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
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="yourname@gmail.com"
          required
        />
        {error.email && (
          <span className="text-red-500 text-xs">{error.email}</span>
        )}
        <input type="password" name="password" />
        {error.password && (
          <span className="text-red-500 text-xs">{error.password}</span>
        )}
        <button type="submit" disabled={loader}>
          {loader ? "Logging" : "login"}
        </button>
      </form>
      {error.general && (
        <div className="p-2 bg-red-100 text-red-700 rounded text-sm mb-4">
          {error.general}
        </div>
      )}
      <p>
        new user? <Link href="/signup">Signup</Link> to get started
      </p>
      {/* resend button */}
      {unverifiedEmail && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-700">
            {error?.general || "account not verified"}
          </p>
          <button
            type="button"
            onClick={resendAction} // Pass the caught email here
            className="text-sm font-bold underline"
            disabled={isPending}
          >
            {isPending
              ? "resending"
              : `Resend verification email to${unverifiedEmail}`}
          </button>
        </div>
      )}
    </div>
  );
}
