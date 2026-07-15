"use client";

import { useTransition, Dispatch, SetStateAction } from "react";
import deleteAccount from "@/app/actions/deleteAccountAction";
import { Button } from "@/components/ui/button";

export default function DeleteAccountButton({
  setError,
  setDeleting,
}: {
  setError: Dispatch<SetStateAction<string>>;
  setDeleting: Dispatch<SetStateAction<boolean>>;
}) {
  const [isPending, startTransition] = useTransition();
  function handleDeleteAccount() {
    setError("");
    setDeleting(true);

    startTransition(async () => {
      try {
        const result = await deleteAccount();

        if (result?.ok === false) {
          setError(result?.error ?? "Something went wrong. Please try again.");
          setDeleting(false);
        }
      } catch (error) {
        console.error(error);
        setError("Network error. Please check your connection and try again.");
        setDeleting(false);
      }
    });
  }
  return (
    <Button
      variant="destructive"
      className="w-full sm:w-auto rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
      onClick={handleDeleteAccount}
      disabled={isPending}
    >
      {isPending ? "Deleting..." : "Yes, delete my account"}
    </Button>
  );
}
