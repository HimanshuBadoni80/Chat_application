import * as z from "zod";
import { nanoidRegex } from "../conversation/Schemas";

export const createContactSchema = z
  .object({
    uid: z
      .string()
      .trim()
      .regex(nanoidRegex, { error: "Enter a valid 6-character user ID" }),
  })
  .strict();
