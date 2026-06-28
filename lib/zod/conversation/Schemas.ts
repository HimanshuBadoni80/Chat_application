import * as z from "zod";

const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ23456789";
export const nanoidRegex = new RegExp(`^[${alphabet}]{6}$`);

// Public user IDs are six-character nanoid values.
export const initChatSchema = z.string().regex(nanoidRegex);
