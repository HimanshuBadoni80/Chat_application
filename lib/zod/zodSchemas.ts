import * as z from "zod";

// for signup front and api
export const signUpSchema = z.object({
  userEmail: z.email({ error: "Invalid Email format" }),
  userPassword: z.string().min(8, "Too short"),
});

// for resend api
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Invalid email format" }));

// for login front and api
export const zodLogin = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email())
    .refine((email) => !email.includes(".."), {
      error: "Email cannot contain consecutive dots",
    }),
  password: z
    .string()
    .min(12, { error: "Password must be at least 12 characters" })
    .max(128, { error: "Password must be at most 128 characters" })
    .refine((s) => /[a-z]/.test(s), {
      error: "Must include a lowercase letter",
    })
    .refine((s) => /[A-Z]/.test(s), {
      error: "Must include an uppercase letter",
    })
    .refine((s) => /\d/.test(s), { error: "Must include a number" })
    .refine((s) => /[^A-Za-z0-9]/.test(s), { error: "Must include a symbol" })
    .refine((s) => !/\s/.test(s), { error: "Must not contain spaces" }),
});

// for confirm password matches password
/* export const passwordWithConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }); */
