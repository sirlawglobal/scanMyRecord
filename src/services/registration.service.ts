import { z } from "zod";
import { registrationSchema } from "@/lib/validation/registration.schema";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Programme from "@/models/Programme";
import Registration from "@/models/Registration";
import { queueOutboxEmail } from "@/services/outbox.service";

export function generateRegistrationReference(year = new Date().getFullYear()) {
  const sequence = Math.floor(Math.random() * 900000) + 100000;
  return `SMR-${year}-${sequence}`;
}

export function validateRegistrationInput(data: unknown) {
  return registrationSchema.safeParse(data);
}

export function createRegistrationReferenceFromData(data: unknown) {
  const parsed = validateRegistrationInput(data);

  if (!parsed.success) {
    throw new z.ZodError(parsed.error.issues);
  }

  return {
    ...parsed.data,
    reference: generateRegistrationReference(),
  };
}

export type CreateRegistrationResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

/**
 * Persists a public programme registration. Enforces the programme's
 * open/closed state, registration deadline, and capacity, and relies on the
 * Registration model's compound (email, programmeId) unique index to reject
 * duplicate registrations.
 */
export async function createRegistration(
  programmeSlug: string,
  data: unknown,
): Promise<CreateRegistrationResult> {
  const parsed = validateRegistrationInput(data);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid registration data." };
  }

  if (!hasValidMongoUri()) {
    return { ok: false, error: "Registrations are not available right now. Please try again later." };
  }

  await connectToDatabase();

  const programme = await Programme.findOne({ slug: programmeSlug });

  if (!programme) {
    return { ok: false, error: "Programme not found." };
  }

  if (!programme.registrationOpen || programme.status !== "active") {
    return { ok: false, error: "Registration is closed for this programme." };
  }

  if (programme.registrationDeadline && new Date() > new Date(programme.registrationDeadline)) {
    return { ok: false, error: "The registration deadline for this programme has passed." };
  }

  if (typeof programme.capacity === "number") {
    const registeredCount = await Registration.countDocuments({ programmeId: programme._id });

    if (registeredCount >= programme.capacity) {
      return { ok: false, error: "This programme has reached its registration capacity." };
    }
  }

  const { fullName, email, phone, ...rest } = parsed.data;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const reference = generateRegistrationReference();

    try {
      await Registration.create({
        programmeId: programme._id,
        reference,
        fullName,
        email,
        phone,
        payload: rest,
      });

      // Persist to Outbox and trigger asynchronous non-blocking email dispatch
      await queueOutboxEmail({
        recipient: email,
        eventType: "programme.registration",
        payload: {
          reference,
          fullName,
          email,
          phone,
          programmeTitle: programme.title,
          programmeCategory: programme.category || "General",
          programmeSlug: programme.slug,
          politicianName: process.env.NEXT_PUBLIC_POLITICIAN_NAME || "Mr. Temple",
          politicianOffice: process.env.NEXT_PUBLIC_POLITICIAN_OFFICE || "Governor of the state",
          politicianConstituency: process.env.NEXT_PUBLIC_POLITICIAN_CONSTITUENCY || "Ife East Federal Constituency",
        },
      }).catch((err) => {
        console.error("Outbox queueing warning:", err);
      });

      return { ok: true, reference };
    } catch (error) {
      const mongoError = error as { code?: number; keyPattern?: Record<string, unknown> };

      if (mongoError?.code === 11000) {
        if (mongoError.keyPattern?.reference && attempt < 2) {
          continue;
        }

        return { ok: false, error: "You have already registered for this programme with this email." };
      }

      throw error;
    }
  }

  return { ok: false, error: "Could not generate a unique registration reference. Please try again." };
}

export async function getRegistrationByReference(reference: string) {
  if (!reference || !hasValidMongoUri()) {
    return null;
  }

  try {
    await connectToDatabase();
    return await Registration.findOne({ reference }).lean();
  } catch {
    return null;
  }
}
