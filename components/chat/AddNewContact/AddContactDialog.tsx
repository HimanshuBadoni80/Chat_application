"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import apiFetch from "@/lib/fetchapi/fetchWrapper";
import { ApiResponse, isApiResponse } from "@/lib/types/api";
import { useRouter } from "next/navigation";

type AddContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ContactDto = {
  _id: string;
  user: {
    _id: string;
    uid: string;
    username: string | null;
  };
  createdAt: string;
};

export default function AddContactDialog(props:AddContactDialogProps) {
  const [inputUid, setInputUid] = useState("");

  const[error,setError] = useState<string|null>(null);

  const [submitting,setSubmitting] = useState(false);

  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open && submitting) return;

    if (!open) {
      setError(null);
      setInputUid("");
    }
    props.onOpenChange(open);
  }; // Preventing the dialog from closing mid-request.

  const handleSubmit = async (event:React.FormEvent<HTMLFormElement>) =>{
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await apiFetch<ApiResponse<ContactDto>>(
      "/api/contacts",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: inputUid.trim() }),
      },
    );
    if (!response.success) {
      throw response;
    }

    if (!response.data) {
      throw new Error("Contact was added, but no contact details were returned");
    }

    setInputUid("");
    props.onOpenChange(false); // close dialog
    } catch (error) {
      if (isApiResponse(error)) {
        // The endpoint returns this when the session has expired.
        if (
          error.error?.code === "NO_ACTIVE_SESSION" &&
          typeof error.data === "object" &&
          error.data !== null &&
          "redirectTo" in error.data &&
          typeof error.data.redirectTo === "string"
        ) {
          router.push(error.data.redirectTo);
          return;
        }

        setError(error.message || "Unable to start the conversation.");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to start the conversation. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }

  }
  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={handleSubmit}>
          <DialogHeader className="text-center">
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <Field className="mt-4">
            <Label htmlFor="contact-uid">UID (shareable ID)</Label>
            <Input
              id="contact-uid"
              name="uid"
              value={inputUid}
              onChange={(e) => {
                setInputUid(e.target.value);
                if (error) setError(null);
              }}
              required
              maxLength={6}
              autoComplete="off"
              disabled={submitting}
              aria-describedby={error ? "contact-uid-error" : undefined}
            />
          </Field>
          {error && (
            <p id="contact-uid-error" className="mt-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-4 pl-[18] pr-[30] bg-primary hover:bg-muted text-from-foreground hover:text-bg-muted-foreground"
            >
              <Plus />
              {submitting ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
    </Dialog>
  );
}
