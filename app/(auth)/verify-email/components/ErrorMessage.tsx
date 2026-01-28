import Link from "next/link";
import { ApiResponse } from "@/lib/types/api";
import { PageStatus } from "../page";
import { useState, useEffect } from "react";
import { useSearchParams,useRouter } from "next/navigation";
interface ErrorMessageProps {
  errorMessage: string;
  resend: (email: string | null) => Promise<ApiResponse>;
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
      setErrorMessage("an unexpected error occured");
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
    <div>
      <div>{errorMessage}</div>
      <button onClick={handleResend} disabled={isPending || countdown > 0}>
        {isPending
          ? "sending"
          : countdown > 0
            ? `wait ${countdown}s`
            : "resend email"}
      </button>
      <p>
        Entered wrong email?<Link href="/signup">click</Link>to go back
      </p>
      {success && <p>email has been sent</p>}
    </div>
  );
}
