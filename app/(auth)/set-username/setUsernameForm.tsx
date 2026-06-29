"use client";

import { useState } from "react";
import { usernameSchema } from "@/lib/zod/zodSchemas";
import { z } from "zod";
import apiFetch from "@/lib/fetchapi/fetchWrapper";
import { ApiResponse, isApiResponse } from "@/lib/types/api";
import Success from "./success";

export interface receivedData {
  uid: string;
  username: string;
  redirectTo: string;
}

export default function SetUserNameForm() {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});

  const [responseData, setResponseData] = useState<receivedData | null>(null);

  const handleSubmit = async function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError({});

    const normalize = username.trim().replace(/\s+/g, "_").toLowerCase();
    // The shared schema expects the same object shape sent to the API.
    const validation = usernameSchema.safeParse({ username: normalize });
    if (!validation.success) {
      const flattened = z.flattenError(validation.error);
      setError(
        Object.fromEntries(
          Object.entries(flattened.fieldErrors).map(([key, value]) => [
            key,
            value?.[0] || "invalid",
          ]),
        ),
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Keep the endpoint absolute so it does not depend on the current route.
      const targetUrl = "/api/users/username";
      const options = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
      };
      const response = await apiFetch<
        ApiResponse<{ uid: string; username: string; redirectTo: string }>
      >(targetUrl, options);

      if (response.success && response.data) {
        // This state is only for the success card. If the page is refreshed,
        // page.tsx reads the saved username and redirects safely to /chat.
        setResponseData(response.data);
      }
    } catch (error) {
      if (isApiResponse(error) && error.error) {
        if (error.error.code === "VALIDATION_ERROR") {
          setError(error.error.details || { general: error.message });
          return;
        }

        if (error.error.code === "USER_EXISTS") {
          setError(error.error.details || { username: error.message });
          return;
        }
      }

      setError({
        general:
          error instanceof Error
            ? error.message
            : "Could not save username. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (responseData) return <Success data={responseData} />;

  return (
    <div className="w-full">
      <div className="text-center">
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Choose a Username
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Set your unique username to continue
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-foreground"
            >
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                type="text"
                value={username}
                placeholder="johndoe"
                required
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-sm"
              />
            </div>
            {error.username && (
              <p className="mt-2 text-sm text-destructive">{error.username}</p>
            )}
          </div>
        </div>

        {error.general && (
          <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive">
            {error.general}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`group relative flex w-full justify-center overflow-hidden rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
              isSubmitting
                ? "opacity-70 cursor-not-allowed hover:scale-100 active:scale-100"
                : ""
            }`}
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></span>
            {isSubmitting ? (
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
                Saving...
              </span>
            ) : (
              <span className="relative z-10">Save Username</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

