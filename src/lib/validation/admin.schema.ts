import { z } from "zod";

const text = (max: number, label: string) =>
  z.string({ error: `${label} must be text.` }).trim().max(max, `${label} must be at most ${max} characters.`);

const requiredText = (max: number, label: string) =>
  text(max, label).min(1, `${label} is required.`);

// Uploaded media is either an absolute https URL (Cloudinary) or a file in the
// local /uploads fallback directory. Anything else (javascript:, data:, http:)
// is rejected.
export const mediaUrlSchema = z
  .string({ error: "Media URL must be text." })
  .trim()
  .max(2048, "Media URL is too long.")
  .refine((value) => {
    if (/^\/uploads\/[\w.-]+$/.test(value)) {
      return true;
    }

    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Media URLs must be https links or uploaded files.");

const mediaItemSchema = z.object({
  url: mediaUrlSchema,
  type: z.enum(["image", "video"], { error: "Media type must be image or video." }).optional(),
  stage: z.enum(["before", "after", "general"], { error: "Media stage must be before, after or general." }).optional(),
  caption: text(300, "Media caption").optional(),
});

export const PROJECT_STATUSES = ["completed", "ongoing"] as const;
export const PROGRAMME_STATUSES = ["active", "paused", "closed"] as const;

const blankToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);
const blankToNull = (value: unknown) => (value === "" ? null : value);

// Fields carry no defaults so the same shape serves create and (partial) update;
// create handlers apply defaults themselves.
const projectFields = {
  title: requiredText(160, "Title"),
  summary: text(2000, "Summary"),
  category: requiredText(80, "Category"),
  status: z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : blankToUndefined(value)),
    z.enum(PROJECT_STATUSES, { error: "Status must be completed or ongoing." }).optional(),
  ),
  year: z.preprocess(
    blankToUndefined,
    z.coerce
      .number({ error: "Year must be a number." })
      .int("Year must be a whole number.")
      .min(1900, "Year must be 1900 or later.")
      .max(2100, "Year must be 2100 or earlier.")
      .optional(),
  ),
  location: text(200, "Location"),
  media: z.array(mediaItemSchema, { error: "Media must be an array of { url, type, stage } items." }).max(30, "At most 30 media items are allowed."),
};

export const projectCreateSchema = z.object({
  ...projectFields,
  summary: projectFields.summary.optional(),
  location: projectFields.location.optional(),
  media: projectFields.media.optional(),
});

export const projectUpdateSchema = z.object(projectFields).partial();

const programmeFields = {
  title: requiredText(160, "Title"),
  description: text(5000, "Description"),
  category: requiredText(80, "Category"),
  status: z.enum(PROGRAMME_STATUSES, { error: "Status must be active, paused or closed." }),
  registrationOpen: z.boolean({ error: "registrationOpen must be true or false." }),
  capacity: z.preprocess(
    blankToNull,
    z.coerce
      .number({ error: "Capacity must be a number." })
      .int("Capacity must be a whole number.")
      .min(1, "Capacity must be at least 1.")
      .max(1_000_000, "Capacity is too large.")
      .nullable(),
  ),
  registrationDeadline: z.preprocess(
    blankToNull,
    z.coerce.date({ error: "Registration deadline is not a valid date." }).nullable(),
  ),
  images: z.array(mediaUrlSchema, { error: "Images must be an array of URLs." }).max(20, "At most 20 images are allowed."),
};

export const programmeCreateSchema = z.object({
  title: programmeFields.title,
  description: programmeFields.description.optional(),
  category: programmeFields.category.optional(),
  registrationOpen: programmeFields.registrationOpen.optional(),
  capacity: programmeFields.capacity.optional(),
  registrationDeadline: programmeFields.registrationDeadline.optional(),
  images: programmeFields.images.optional(),
});

export const programmeUpdateSchema = z.object(programmeFields).partial();

/** First human-readable problem from a failed parse, e.g. "Title is required." */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
