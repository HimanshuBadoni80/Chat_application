// this function is used by the layouts to authenticate the session token, DB auth.

import crypto from "crypto";
import connectDB from "./actions/mongodb";
import Session from "./Models/Session";
import { cookies } from "next/headers";

export default async function GetSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("session_token")?.value;

  // if no token found
  if (!rawToken) {
    return null;
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await connectDB();

  try {
    const session = await Session.findOne({
      sessionToken: hashedToken,
      expiresAt: { $gt: new Date() },
    }).populate("userId", " _id uid username email isVerified").lean();

    // if no user found with the token
    if (!session || !session.userId) {
      return null;
    }
    // Return the whole object so the layout can use session data AND user data
    return session;
  } catch (error) {
    console.error("failed to get session:", error);
    return null; //Return null so the UI can redirect to login safely
  }
}
