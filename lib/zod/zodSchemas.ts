import { z } from "zod";

export const signUpSchema = z.object({
  userEmail: z.email({error:"Invalid Email format"}),
  userPassword: z.string().min(8, "Too short"),
});
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Invalid email format" }));