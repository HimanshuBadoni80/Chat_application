import connectDB from "@/lib/actions/mongodb";
import Session from "@/lib/Models/Session";
import crypto from "crypto";
export default async function deleteSession(rawToken: string) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await connectDB();
  await Session.deleteOne({ sessionToken: hashedToken });
}
