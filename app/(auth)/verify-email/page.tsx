"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSignUpStore } from "@/lib/store";
import apiFetch from "@/lib/fetchapi/fetchWrapper";
import { ApiResponse } from "@/lib/types/api";
import CheckInboxView from "./components/checkInboxView";
import VerifyLoader from "./components/VerifyingLoader";
import Success from "./components/SuccessMessage";
import ErrorMessage from "./components/ErrorMessage";

export type PageStatus = "idle" | "checking" | "error" | "success";

function VerifyUser() {
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email");
  const storeEmail = useSignUpStore((state) => state.email);
  const resend = useSignUpStore((state) => state.resend);
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState<PageStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // absolute guard
    if (!urlEmail) {
      router.replace("/signup");
      return;
    }
    // for idle status
    if (!token && urlEmail !== storeEmail) {
      router.replace("/signup");
      return;
    }
    let isActive = true;
    if (token) {
      // call to api
      const handleApiCall = async (urlEmail: string, urlToken: string) => {
        setStatus("checking");
        try {
          await apiFetch<ApiResponse>(
            `/api/auth/verify?email=${encodeURIComponent(urlEmail)}&token=${urlToken}`,
          );
          if (!isActive) return;
          setStatus("success");
        } catch (error) {
          if (!isActive) return;
          setStatus("error");

          if (error && typeof error === "object" && "message" in error) {
            const apiError = error as ApiResponse;
            setErrorMessage(apiError.message || "Invalid Link");
            return;
          }
          if (error instanceof Error) {
            setErrorMessage(error.message);
            return;
          }

          setErrorMessage("an unexpected error occured");
        }
      };
      handleApiCall(urlEmail, token);
    }
    return () => {
      isActive = false;
    };
  }, [token, urlEmail, router, storeEmail]);
  if (status === "checking") return <VerifyLoader />;
  if (status === "success") return <Success />;
  if (status === "error") return <ErrorMessage errorMessage={errorMessage} resend={resend} setStatus={setStatus} setErrorMessage={setErrorMessage} />;
  // Default: The "Check your inbox" screen
  return (
    <CheckInboxView
      email={urlEmail}
      resend={resend}
      setErrorMessage={setErrorMessage}
      setStatus={setStatus}
    />
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyUser />
    </Suspense>
  );
}
