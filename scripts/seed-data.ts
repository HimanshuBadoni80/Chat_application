// Import Next's environment-loader.
// A plain TypeScript script is not started by Next.js, so it does not
// automatically read .env.local like `next dev` does.
import { loadEnvConfig } from "@next/env";

// Import Mongoose so we can close the database connection at the end.
import mongoose from "mongoose";

// Import Node's built-in crypto module.
// We use randomUUID() to create unique message tempIds.
import crypto from "node:crypto";

// Load .env.local from the project's current directory.
// This must happen before dynamically importing your database module.
loadEnvConfig(process.cwd());

async function main() {
  // Refuse to run when Next says this is a production environment.
  // Seed data must never be inserted into production by accident.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed production.");
  }

  // Require an explicit confirmation before writing to MongoDB.
  // Run with: SEED_DATABASE=true npm run seed
  if (process.env.SEED_DATABASE !== "true") {
    throw new Error(
      "Refusing to seed. Run: SEED_DATABASE=true npm run seed",
    );
  }

  // Import these only AFTER .env.local was loaded.
  // Your mongodb.ts reads MONGODB_URI at module load time, so a normal
  // top-level import would be too early for a standalone script.
  const [{ default: connectDB }, models] = await Promise.all([
    import("../lib/actions/mongodb"),
    import("../lib/Models"),
  ]);

  // Extract the Mongoose models you need.
  const { User, Contact, Conversation, Message } = models;

  // Open a MongoDB connection.
  await connectDB();

  try {
    // User.create() runs your UserSchema pre("save") middleware.
    // That middleware hashes each plaintext password.
    // Do NOT replace this with insertMany() for users.
    const [asha, ravi, meera] = await User.create([
      {
        email: "asha@seed.local",
        username: "asha",
        password: "SeedPassword123!",
        isVerified: true,
      },
      {
        email: "ravi@seed.local",
        username: "ravi",
        password: "SeedPassword123!",
        isVerified: true,
      },
      {
        email: "meera@seed.local",
        username: "meera",
        password: "SeedPassword123!",
        isVerified: true,
      },
    ]);

    // A Contact is private.
    // ownerId = the user who saved the contact.
    // userId = the person they saved.
    await Contact.create([
      {
        ownerId: asha._id,
        userId: ravi._id,
      },
      {
        ownerId: asha._id,
        userId: meera._id,
      },
      {
        ownerId: ravi._id,
        userId: asha._id,
      },
    ]);

    // A conversation is shared by its participants.
    // It has no messages yet at the moment it is created.
    const conversation = await Conversation.create({
      participants: [asha._id, ravi._id],
      isGroup: false,
    });

    // Each message must reference:
    // - the conversation it belongs to
    // - the user who sent it
    // - a globally unique tempId because your Message model indexes tempId
    const firstMessage = await Message.create({
      tempId: crypto.randomUUID(),
      conversationId: conversation._id,
      senderId: asha._id,
      content: "Hey Ravi, welcome to the seed chat!",
      messageType: "text",
      status: "read",
    });

    const latestMessage = await Message.create({
      tempId: crypto.randomUUID(),
      conversationId: conversation._id,
      senderId: ravi._id,
      content: "Thanks, Asha. Everything looks good!",
      messageType: "text",
      status: "read",
    });

    // ConversationList uses conversation.lastMessage for previews.
    // Set it to the most recently created message.
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: latestMessage._id,
    });

    // This confirms successful completion in the terminal.
    console.log("Seed data created successfully.");

    // This prevents TypeScript/ESLint from considering firstMessage unused
    // while still making the seed sequence easy to read.
    console.log(`Created first message: ${firstMessage._id}`);
  } finally {
    // Always close the connection—whether seeding succeeds or throws.
    // Otherwise the terminal command may appear to hang.
    await mongoose.disconnect();
  }
}

// Run main().
// `void` means we intentionally do not use the Promise it returns.
void main().catch((error) => {
  // Print the real error for debugging.
  console.error("Seeding failed:", error);

  // Tell the shell that the command failed.
  process.exitCode = 1;
});