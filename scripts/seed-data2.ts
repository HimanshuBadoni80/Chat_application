import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import crypto from "node:crypto";

// Standalone scripts are not started by Next.js, so load .env.local before
// importing the database module that reads MONGODB_URI.
loadEnvConfig(process.cwd());

const MY_USER_ID = "6a7430e79f7f95b611c25a69";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed production.");
  }

  if (process.env.SEED_DATABASE !== "true") {
    throw new Error(
      "Refusing to seed. Run: SEED_DATABASE=true npx tsx scripts/seed-data2.ts",
    );
  }

  const [{ default: connectDB }, models] = await Promise.all([
    import("../lib/actions/mongodb"),
    import("../lib/Models"),
  ]);

  const { User, Conversation, Message } = models;

  await connectDB();

  try {
    // This script creates conversations *with* this existing user; it does not
    // create or modify the user's account.
    const me = await User.findOne({
      _id: MY_USER_ID,
      isDeleted: false,
    }).select("_id");

    if (!me) {
      throw new Error(
        `Active user ${MY_USER_ID} was not found. Create/sign in as that user before seeding.`,
      );
    }

    // User.create(singleDoc) triggers the pre('save') middleware which hashes
    // the password. IMPORTANT: User.create([array]) uses insertMany() and
    // SKIPS save middleware — passwords would be stored in plaintext.
    const seedUserData = [
      {
        username: "ananya",
        email: "ananya.seed2@seed.local",
        password: "SeedPassword123!",
        isVerified: true,
      },
      {
        username: "dev",
        email: "dev.seed2@seed.local",
        password: "SeedPassword123!",
        isVerified: true,
      },
      {
        username: "farah",
        email: "farah.seed2@seed.local",
        password: "SeedPassword123!",
        isVerified: true,
      },
      {
        username: "kabir",
        email: "kabir.seed2@seed.local",
        password: "SeedPassword123!",
        isVerified: true,
      },
      {
        username: "nisha",
        email: "nisha.seed2@seed.local",
        password: "SeedPassword123!",
        isVerified: true,
      },
      {
        username: "om",
        email: "om.seed2@seed.local",
        password: "SeedPassword123!",
        isVerified: true,
      },
      {
        username: "priya",
        email: "priya.seed2@seed.local",
        password: "SeedPassword123!",
        isVerified: true,
      },
    ];

    const users = await Promise.all(
      seedUserData.map((data) => User.create(data)),
    );

    // Only the first five new users receive a direct conversation with "me".
    // The Conversation pre-validate hook derives each unique directKey.
    const chatPartners = users.slice(0, 5);
    const conversations = await Promise.all(
      chatPartners.map((user) =>
        Conversation.create({
          participants: [me._id, user._id],
          isGroup: false,
        }),
      ),
    );

    const messageContents = [
      "Hey! This is our seeded conversation.",
      "I have added some data for the chat sidebar.",
      "Let me know when you are ready to test the draft flow.",
      "This conversation should appear in the inbox.",
      "Last seeded message for this chat.",
    ];

    // Each conversation receives exactly one message. Its ObjectId is saved as
    // the conversation's lastMessage so the inbox can render a preview.
    const lastMessages = await Message.create(
      conversations.map((conversation, index) => ({
        tempId: crypto.randomUUID(),
        conversationId: conversation._id,
        senderId:
          index % 2 === 0 ? chatPartners[index]._id : me._id,
        content: messageContents[index],
        messageType: "text",
        status: "read",
      })),
    );

    await Promise.all(
      conversations.map((conversation, index) =>
        Conversation.findByIdAndUpdate(conversation._id, {
          $set: { lastMessage: lastMessages[index]._id },
        }),
      ),
    );

    console.log(
      `Created ${users.length} users, ${conversations.length} conversations, and ${lastMessages.length} messages.`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

void main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
});
