import * as z from "zod";
import { conversationDtoSchema } from "./conversation.schema";
const isMongoObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

export const messageTypeSchema = z.enum(["text", "image", "file"]);

// These are the only states a message may have after the server persists it.
export const persistedMessageStatusSchema = z.enum([
  "sent",
  "delivered",
  "read",
]);

const messageContentSchema = z
  .string()
  .min(1, { error: "Message cannot be empty" })
  .max(2000, { error: "Message too long" });

// Browser -> server. The server supplies senderId, _id, status, and createdAt.
export const baseMessageFields = z.object({
  tempId: z.string().min(1, { error: "Message tempId is required" }),
  content: messageContentSchema,
  messageType: messageTypeSchema.default("text"),
});

export const sendMessageSchema = z.discriminatedUnion("kind", [
  baseMessageFields.extend({
    kind: z.literal("existing"),
    conversationId: z
      .string()
      .min(1, { error: "Conversation ID is required" })
      .refine(isMongoObjectId, {
        error: "Invalid conversation ID",
      }),
  }),
  baseMessageFields.extend({
    kind: z.literal("new"),
    contactId: z
      .string()
      .min(1, { error: "Contact ID is required" })
      .refine(isMongoObjectId, {
        error: "Invalid contact ID",
      }),
  }),
]);

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// Server -> browser. This is used for HTTP responses, history, sync, and
// WebSocket messages. Persisted messages always have a database ID and the
// client-generated idempotency key.
export const messageDtoSchema = z.object({
  _id: z.string().min(1),
  tempId: z.string().min(1),
  conversationId: z.string().min(1),
  senderId: z.string().min(1),
  content: messageContentSchema,
  messageType: messageTypeSchema,
  status: persistedMessageStatusSchema,
  createdAt: z.iso.datetime(),
});

export type MessageDto = z.infer<typeof messageDtoSchema>;

// Browser-only state before the server assigns a database ID.
export type OptimisticMessage = Omit<MessageDto, "_id" | "status"> & {
  status: "pending" | "failed";
};

// Zustand can temporarily contain an optimistic message or a persisted one.
export type ChatMessage = MessageDto | OptimisticMessage;

export const SocketMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("IDENTIFY"), userId: z.string() }),
  z.object({ type: z.literal("IDENTIFIED") }), 
  z.object({ type: z.literal("NEW_MESSAGE"), payload: messageDtoSchema }),
  z.object({
    type: z.literal("NEW_CONVERSATION_MESSAGE"),
    payload: z.object({
      // Deferred to avoid eager evaluation of the schema-module cycle.
      conversation: z.lazy(() => conversationDtoSchema),
      message: messageDtoSchema,
    }),
  }),
  z.object({ type: z.literal("PONG") }),
  z.object({ type: z.literal("PING") }),
  z.object({ type: z.literal("MARK_DELIVERED"), messageId: z.string() }),
  z.object({
    type: z.literal("TYPING_INDICATOR"),
    conversationId: z.string(),
    typingStatus: z.enum(["start", "stop"]),
  }),
]);

export type SocketMessage = z.infer<typeof SocketMessageSchema>;

export const historyFetchSchema = z.object({
  conversationId: z.string().refine(isMongoObjectId, {
    error: "Invalid conversation ID",
  }),
  createdAt: z.coerce.date({ error: "Invalid createdAt date" }).optional(),
});

export type HistoryFetchSchema = z.infer<typeof historyFetchSchema>;
