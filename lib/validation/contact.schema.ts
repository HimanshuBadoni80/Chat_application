import * as z from "zod";

const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ23456789";
export const nanoidRegex = new RegExp(`^[${alphabet}]{6}$`);

export const createContactSchema = z
  .object({
    uid: z
      .string()
      .trim()
      .regex(nanoidRegex, { error: "Enter a valid 6-character user ID" }),
    nickname: z
      .string()
      .trim()
      .min(1, { error: "Nickname must be at least 1 character" }),
  })
  .strict();

export function extractZodError(error: z.ZodError) {
  const flattened = z.flattenError(error);
  const details = Object.fromEntries(
    Object.entries(flattened.fieldErrors).map(([key, msgs]) => [
      key,
      (msgs as string[] | undefined)?.[0] ?? "Invalid value",
    ]),
  );
  return details;
}

export type ContactDto = {
  _id: string;
  user: {
    _id: string;
    uid: string;
    username: string | null;
  } | null;
  createdAt: string;
};
