import { z } from "zod";

const requiredText = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(min, `${label} is required.`)
    .max(max, `${label} must be at most ${max} characters.`);

const customFieldValueSchema = z.union([
  z.string().max(2000, "A custom field answer is too long."),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

// Keys become property names on a stored document, so `$`-prefixed or dotted
// keys (MongoDB operator/path syntax) and prototype-style names are rejected.
const CUSTOM_FIELD_KEY = /^[A-Za-z][A-Za-z0-9_-]{0,49}$/;

export const registrationSchema = z.object({
  fullName: requiredText(2, 120, "Full name"),
  phone: z
    .string({ error: "Phone number is required." })
    .trim()
    .regex(/^\+?[0-9][0-9\s()-]{5,18}[0-9]$/, "Enter a valid phone number (7-20 digits, e.g. 08031234567)."),
  // Normalised so "A@x.com" and "a@x.com" hit the same duplicate-registration index.
  email: z
    .string({ error: "A valid email is required." })
    .trim()
    .toLowerCase()
    .max(254, "Email is too long.")
    .email("A valid email is required."),
  address: requiredText(5, 300, "Address"),
  state: requiredText(2, 80, "State"),
  lga: requiredText(2, 80, "LGA"),
  customFields: z
    .record(z.string().regex(CUSTOM_FIELD_KEY, "Invalid custom field name."), customFieldValueSchema)
    .refine((fields) => Object.keys(fields).length <= 30, "Too many custom fields.")
    .default({}),
  // Honeypot: real users never see or fill this; bots tend to.
  website: z.string().max(200).optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type ProgrammeFieldDefinition = {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "select" | "textarea" | "date";
  required?: boolean;
  options?: string[];
};

type CustomFieldValues = Record<string, string | number | boolean | null>;

/**
 * Checks submitted custom answers against the programme's own field
 * definitions: no unknown keys, required answers present, and each value
 * matching its declared type (select answers must be one of the options).
 */
export function validateCustomFields(
  definitions: ProgrammeFieldDefinition[],
  submitted: CustomFieldValues,
): { ok: true; values: CustomFieldValues } | { ok: false; error: string } {
  const known = new Map(definitions.map((definition) => [definition.name, definition]));

  for (const key of Object.keys(submitted)) {
    if (!known.has(key)) {
      return { ok: false, error: `Unexpected field "${key}".` };
    }
  }

  const values: CustomFieldValues = {};

  for (const definition of definitions) {
    const raw = submitted[definition.name];
    const isBlank = raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "");

    if (isBlank) {
      if (definition.required) {
        return { ok: false, error: `${definition.label} is required.` };
      }

      continue;
    }

    switch (definition.type) {
      case "number": {
        const numeric = typeof raw === "number" ? raw : Number(raw);

        if (typeof raw === "boolean" || !Number.isFinite(numeric)) {
          return { ok: false, error: `${definition.label} must be a number.` };
        }

        values[definition.name] = numeric;
        break;
      }
      case "email": {
        const email = String(raw).trim().toLowerCase();

        if (!z.string().email().safeParse(email).success) {
          return { ok: false, error: `${definition.label} must be a valid email.` };
        }

        values[definition.name] = email;
        break;
      }
      case "date": {
        if (typeof raw !== "string" || Number.isNaN(new Date(raw).getTime())) {
          return { ok: false, error: `${definition.label} must be a valid date.` };
        }

        values[definition.name] = raw;
        break;
      }
      case "select": {
        if (typeof raw !== "string" || !(definition.options ?? []).includes(raw)) {
          return { ok: false, error: `${definition.label} must be one of the listed options.` };
        }

        values[definition.name] = raw;
        break;
      }
      default: {
        if (typeof raw !== "string") {
          return { ok: false, error: `${definition.label} must be text.` };
        }

        values[definition.name] = raw.trim();
      }
    }
  }

  return { ok: true, values };
}
