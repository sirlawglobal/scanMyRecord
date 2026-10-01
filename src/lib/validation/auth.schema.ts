import { z } from "zod";

// Deliberately lenient on password length: it only bounds the input (argon2 on a
// huge string is a cheap DoS). Strength rules apply when a password is created.
export const loginSchema = z.object({
  email: z.string().trim().max(254, "Email is too long.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required.").max(128, "Password is too long."),
});

export type LoginInput = z.infer<typeof loginSchema>;
