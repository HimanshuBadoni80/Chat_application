import { z } from "zod";

export const signUpSchema = z.object({
  userEmail: z.email({error:"Invalid Email format"}),
  userPassword: z.string().min(8, "Too short"),
});