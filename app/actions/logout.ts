"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import deleteSession from "@/lib/auth/logoutService";

export default async function logout() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("session_token")?.value;

  if (rawToken) {
    try {
      await deleteSession(rawToken);
    } catch (error) {
      console.error("Logout Error (DB Cleanup Failed):", error);
    }
  }

  cookieStore.delete({ name: "session_token", path: "/" });
  redirect("/login");
}
