import Link from "next/link";
import { ApiResponse } from "@/lib/types/api";
import { useRouter,useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageStatus } from "../page";
interface CheckInboxProps {
  email: string | null;
  resend: (email:string | null) => Promise<ApiResponse<{userEmail:string}>>;
  setErrorMessage: (errMessage: string) => void;
  setStatus: (status: PageStatus) => void;
}
export default function CheckInboxView({
  email,
  resend,
  setErrorMessage,
  setStatus,
}: CheckInboxProps) {
  const [countdown, setCountdown] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email");

  const router = useRouter();
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
    <div className="flex flex-col">
      <h1>Please verify your email</h1>
      <p>You are almost there! We have sent an email to</p>
      <h2>{email}</h2>
      <p>still cannot find the email</p>
      <button onClick={handleResend} disabled={isPending || countdown > 0}>
        {isPending
          ? "sending"
          : countdown > 0
            ? `wait ${countdown}s`
            : "resend email"}
      </button>
      <p>
        Entered wrong eamil?<Link href="/signup">click</Link>to go back
      </p>
      {success && <p>email has been sent</p>}
    </div>
  );
}
