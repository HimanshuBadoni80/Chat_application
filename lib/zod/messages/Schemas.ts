// for route/send
import * as z from "zod";
// import { initChatSchema } from "../conversation/Schemas";

// used in api/message/send
export const messageSchema = z.object({
  tempId: z.string(),
  conversationId: z.string().min(1, { error: "Conversation ID is required" }),
  content: z
    .string()
    .min(1, { error: "Message cannot be empty" })
    .max(2000, { error: "Message too long" }),
  messageType: z.enum(["text", "image", "file"]).default("text"),
});

export const payloadSchema = z.object({
  _id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z
    .string()
    .min(1, { error: "Message cannot be empty" })
    .max(2000, { error: "Message too long" }),
  messageType: z.enum(["text", "image", "file"]).default("text"),
  createdAt: z.string(),
});
// used in useChatStore.ts
export const SocketMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("IDENTIFY"), userId: z.string() }),
  z.object({ type: z.literal("NEW_MESSAGE"), payload: payloadSchema }),
  z.object({ type: z.literal("PONG") }),
  z.object({ type: z.literal("PING") }),
  z.object({ type: z.literal("MARK_DELIVERED"), messageId: z.string() }),
  z.object({
    type: z.literal("TYPING_INDICATOR"),
    conversationId: z.string(),
    isTyping: z.boolean(),
  }),
]);

const isMongoObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

export const historyFetchSchema = z.object({
  conversationId: z.string().refine(isMongoObjectId, {
    error: "Invalid conversation ID",
  }),
  createdAt: z.coerce
    .date({
      error: "Invalid createdAt date",
    })
    .optional(),
});

export type SocketMessage = z.infer<typeof SocketMessageSchema>;
export type msgSchema = z.infer<typeof messageSchema>;
export type HistoryFetchSchema = z.infer<typeof historyFetchSchema>;
