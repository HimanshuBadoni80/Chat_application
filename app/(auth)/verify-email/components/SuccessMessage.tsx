import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Success() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  useEffect(() => {
    if (countdown === 0) {
      router.push("/login");
    }
  }, [countdown,router]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  });
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visual cue: A green checkmark or icon is better UX than just text */}
      <div className="text-green-500 text-5xl">✅</div>
      <h1 className="text-2xl font-bold">Verification Successful!</h1>
      <p>Your email has been verified. You can now sign in.</p>

      <p className="text-sm text-gray-500">
        Redirecting to login in <strong>{countdown}s</strong>...
      </p>

      {/* Manual link just in case the redirect feels slow */}
      <Link href="/login" className="text-blue-500 underline text-sm">
        Click here if you aren&apost redirected
      </Link>
    </div>
  );
}
