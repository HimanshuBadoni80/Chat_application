"use server";
import { cookies } from "next/headers";
import GetSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import type { updatedClientSession } from "@/lib/types/Conversation";
import { deleteUserAccount } from "@/lib/auth/deleteUserAccount";

type ActionError = {
  ok: false;
  error: string;
};

type DeleteAccountResult =
  | {
      ok: true;
    }
  | ActionError;

async function getSessionResult(): Promise<
  updatedClientSession | ActionError | null
> {
  try {
    const session = await GetSession();
    return session;
  } catch (error) {
    console.error("Session Lookup Error:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

async function tryDeleteUserAccount(
  userId: string,
): Promise<DeleteAccountResult> {
  try {
    await deleteUserAccount(userId);
    return { ok: true };
  } catch (error) {
    console.error("Account deletion failed:", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export default async function deleteAccount():Promise<ActionError | void> {
  const session = await getSessionResult();
  if (!session) redirect("/login"); // null check
  if ("ok" in session) return session; // error check

  const userId = session.user._id;
  const deletionResult = await tryDeleteUserAccount(userId);

  if (!deletionResult.ok) return deletionResult;

  const cookieStore = await cookies();
  cookieStore.delete({ name: "session_token", path: "/" });
  redirect("/");
}
