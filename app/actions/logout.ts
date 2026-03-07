"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import deleteSession from "@/lib/auth/logoutService";


export default async function logout() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("session_token")?.value;

  if (!rawToken) {
    redirect("/login");
  }

  try {
    await deleteSession(rawToken);
    cookieStore.delete("session_token");
    redirect("/login");
  } catch (error) {
    console.error("Logout Error (DB Cleanup Failed):", error);
  } finally {
    cookieStore.delete("session_token");
    redirect("/login");
  }
}
