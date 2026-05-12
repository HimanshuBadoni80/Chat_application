// this function is used by the layouts to authenticate the session token, DB auth.

import crypto from "crypto";
import connectDB from "./actions/mongodb";
import { Session } from "./Models/index";
import { cookies } from "next/headers";

export default async function GetSession() {
  try {
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

    const session = await Session.findOne({
      sessionToken: hashedToken,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "_id uid username email isVerified")
      .lean();

    // if no user found with the token
    if (!session || !session.user) {
      return null;
    }
    // why this is done? .lean() works but mongoose/mongodb keeps the _id as Binary JSON (BSON) until the last possible second to preserve data types.
    session._id = session._id.toString();
    session.user._id = session.user._id.toString();
    return session;
  } catch (error) {
    console.error("failed to get session:", error);
    return null; //Return null so the UI can redirect to login safely
  }
}
