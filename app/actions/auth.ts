"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/lib/actions/mongodb";
import Session from "@/lib/Models/Session";
import crypto from "crypto";

export default async function logout() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("session_token")?.value;

  if (!rawToken) {
    redirect("/login");
  }

  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await connectDB();

    await Session.deleteOne({ sessionToken: hashedToken });
    cookieStore.delete("session_token");
    redirect("/login");
  } catch (error) {
    console.error("Logout Error (DB Cleanup Failed):", error);
  } finally {
    cookieStore.delete("session_token");
    redirect("/login");
  }
}
