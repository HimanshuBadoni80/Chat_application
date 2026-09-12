import * as z from "zod";

export const passwordSchema = z
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
  .refine((s) => !/\s/.test(s), { error: "Must not contain spaces" });

// for signup front and api
export const signUpSchema = z.object({
  userEmail: z.email({ error: "Invalid Email format" }),
  userPassword: passwordSchema,
});

// for resend api,forgot password api
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
  password: passwordSchema,
});

// for confirm password matches password
export const passwordWithConfirmationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// for reset-Password api and frontend
export const resetPasswordSchema = z
  .object({
    token: z.string().trim(),
    email: emailSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, { error: "Username must be at least 3 characters" })
    .max(20, { error: "Username must be at most 20 characters" })
    .regex(/^[a-zA-Z0-9_ ]+$/, {
      error: "Use letters, numbers, spaces, or underscores only",
    }),
});

export const validateMongoIdSchema = z.object({
  targetId: z
    .string()
    .regex(/^[a-f\d]{24}$/i, {
      error: "invalid MongoDb ObejctId",
    }),
});
/* keeping the mongoose-specific server-only
lib/
  validation/
    auth.ts           # shared Zod schemas: strings, emails, passwords
    mongo.ts          # server-only: ObjectId validation / transforms
  db/
    models/           # Mongoose models — server-only

// lib/validation/mongo.ts
import "server-only";
The server-only import makes Next fail early if a client component accidentally imports that module.

import { Types } from "mongoose";
import * as z from "zod";

export const objectIdSchema = z.string().refine(Types.ObjectId.isValid);
*/
