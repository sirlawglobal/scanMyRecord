import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phone: z.string().min(7, "Phone number is required."),
  email: z.string().email("A valid email is required."),
  address: z.string().min(5, "Address is required."),
  state: z.string().min(2, "State is required."),
  lga: z.string().min(2, "LGA is required."),
  customFields: z.record(z.string(), z.any()).default({}),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
