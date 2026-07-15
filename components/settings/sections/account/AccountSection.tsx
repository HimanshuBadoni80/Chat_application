"use client";
import { Trash2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import DeleteAccountButton from "./DeleteAccountButton";

export function AccountSection() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Danger Zone</h3>
        
        {!confirmDelete ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-destructive/20 bg-destructive/5 p-5 gap-4 shadow-sm transition-all hover:border-destructive/30 hover:bg-destructive/10">
            <div className="flex flex-col space-y-1">
              <span className="font-medium text-destructive">Delete Account</span>
              <span className="text-sm text-muted-foreground">
                Permanently remove your account and all associated data.
              </span>
            </div>
            <Button
              variant="destructive"
              className="w-full sm:w-auto rounded-xl"
              onClick={() => {
                setConfirmDelete(true);
                setError("");
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete account
            </Button>
          </div>
        ) : error.trim().length !== 0 ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 shadow-sm">
            <div className="rounded-full bg-destructive/20 p-3 text-destructive ring-1 ring-destructive/30 shadow-inner">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-destructive">Deletion Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDelete(false);
                setError("");
              }}
              className="mt-2 rounded-xl border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 flex flex-col space-y-5 animate-in fade-in zoom-in-95 shadow-sm">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">Are you absolutely sure?</p>
            </div>
            
            {deleting ? (
              <p className="text-sm text-muted-foreground bg-background/60 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-inner">
                <span className="flex items-center gap-3">
                  <svg className="h-5 w-5 animate-spin text-destructive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting your account... Please do not close this window.
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground bg-background/60 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-inner leading-relaxed">
                This action is <strong className="text-foreground font-semibold">permanent</strong>. Your account, conversations, and all messages will be irrevocably deleted from our servers.
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                disabled={deleting} 
                onClick={() => setConfirmDelete(false)}
                className="w-full sm:w-auto rounded-xl"
              >
                Cancel
              </Button>
              <DeleteAccountButton setError={setError} setDeleting={setDeleting} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
