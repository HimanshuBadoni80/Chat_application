import { Types } from "mongoose";
import connectDB from "@/lib/actions/mongodb";
import { User } from "../Models";

export async function deleteUserAccount(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("invalid user ID");
  }

  const mongoose = await connectDB();
  const dbSession = await mongoose.startSession();

  try {
    let deleted = false;
    await dbSession.withTransaction(async function () {
      const result = await User.deleteOne(
        {
          _id: userId,
        },
        {
          session: dbSession,
        },
      );
      deleted = result.deletedCount === 1;

      if (!deleted) throw new Error("User account not found");
    });
  } finally {
    await dbSession.endSession();
  }
}
