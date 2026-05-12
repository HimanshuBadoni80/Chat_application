//for  init/route
import * as z from "zod";

const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ23456789";
export const nanoidRegex = new RegExp(`^[${alphabet}]{6}$`);

// the schema for  init/route should check for six character as it is constructed with nanoid
export const initChatSchema = z.string().regex(nanoidRegex);
