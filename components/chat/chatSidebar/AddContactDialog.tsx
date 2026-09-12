"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldError,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/lib/store/chatStore/store";
import {
  extractFieldErrors,
  extractErrorMessage,
  type FieldErrors,
} from "@/lib/utils/handleStoreErrors";

type AddContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddContactDialog(props: AddContactDialogProps) {
  const [inputUid, setInputUid] = useState("");
  const [nickname, setNickname] = useState("");

  // Field-level errors from Zod: { uid: "...", nickname: "..." }
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null);
  // Generic error string for API/network errors
  const [formError, setFormError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const createContact = useChatStore((state) => state.createContact);

  const clearErrors = () => {
    setFieldErrors(null);
    setFormError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && submitting) return;

    if (!open) {
      clearErrors();
      setInputUid("");
      setNickname("");
    }
    props.onOpenChange(open);
  }; // Preventing the dialog from closing mid-request.

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearErrors();
    setSubmitting(true);

    try {
      const contact = await createContact({
        uid: inputUid,
        nickname,
      });

      if (!contact) return;

      // show success toast,later

      setInputUid("");
      setNickname("");
      props.onOpenChange(false); // close dialog
    } catch (error) {
      const fields = extractFieldErrors(error);
      if (fields) {
        setFieldErrors(fields);
      } else {
        setFormError(extractErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="text-center">
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field className="mt-4">
              <FieldLabel htmlFor="contact-uid">UID (shareable ID)</FieldLabel>
              <Input
                id="contact-uid"
                name="uid"
                value={inputUid}
                onChange={(e) => {
                  setInputUid(e.target.value);
                  if (fieldErrors?.uid) {
                    setFieldErrors((prev) => {
                      if (!prev) return null;
                      const { uid, ...rest } = prev;
                      return Object.keys(rest).length > 0 ? rest : null;
                    });
                  }
                }}
                required
                maxLength={6}
                autoComplete="off"
                disabled={submitting}
                aria-describedby={
                  fieldErrors?.uid ? "contact-uid-error" : undefined
                }
              />
              {fieldErrors?.uid && (
                <FieldError id="contact-uid-error">
                  {fieldErrors.uid}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-name">Set a name</FieldLabel>
              <Input
                id="contact-name"
                name="nickname"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value.trim());
                  if (fieldErrors?.nickname) {
                    setFieldErrors((prev) => {
                      if (!prev) return null;
                      const { nickname, ...rest } = prev;
                      return Object.keys(rest).length > 0 ? rest : null;
                    });
                  }
                }}
                required
                maxLength={50}
                autoComplete="off"
                disabled={submitting}
                aria-describedby={
                  fieldErrors?.nickname ? "contact-name-error" : undefined
                }
              />
              {fieldErrors?.nickname && (
                <FieldError id="contact-name-error">
                  {fieldErrors.nickname}
                </FieldError>
              )}
            </Field>
          </FieldGroup>

          {formError && (
            <p
              className="mt-3 text-sm text-destructive"
              role="alert"
            >
              {formError}
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

