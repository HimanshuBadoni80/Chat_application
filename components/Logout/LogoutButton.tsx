"use client";

import { useTransition } from "react";
import logout from "@/app/actions/logout";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      variant="default"
      className="bg-red-700"
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
    >
      {isPending ? "Logging out..." : "Log out"}
    </Button>
  );
}
