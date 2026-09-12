import * as z from "zod";
import { messageDtoSchema, type ChatMessage } from "./message.schema";

const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ23456789";
export const nanoidRegex = new RegExp(`^[${alphabet}]{6}$`);

// // Public user IDs are six-character nanoid values.
// export const initChatSchema = z.string().regex(nanoidRegex);

export const conversationParticipantDtoSchema = z.object({
  _id: z.string().min(1),
  user: z
    .object({
      uid: z.string().min(1),
      username: z.string().nullable(),
    })
    .nullable(),
});

export type ConversationParticipantDto = z.infer<
  typeof conversationParticipantDtoSchema
>;

export const conversationDtoSchema = z.object({
  _id: z.string().min(1),
  createdAt: z.iso.datetime(),
  participants: z.array(conversationParticipantDtoSchema),
  // `z.lazy` prevents this schema and message.schema.ts from evaluating each
  // other before both modules have finished loading.
  lastMessage: z.lazy(() => messageDtoSchema).nullable(),
});

export type ConversationDTO = z.infer<typeof conversationDtoSchema>;

// Zustand may temporarily show an optimistic last-message preview.
export type ChatConversation = Omit<ConversationDTO, "lastMessage"> & {
  lastMessage: ChatMessage | null;
};
