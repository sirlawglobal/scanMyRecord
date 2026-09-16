import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Outbox, { type IOutbox } from "@/models/Outbox";
import { sendEmail } from "@/lib/email/transporter";
import {
  renderRegistrationConfirmationEmail,
  type RegistrationEmailPayload,
} from "@/lib/email/templates/registration-confirmation";
import {
  renderDonationReceiptEmail,
  type DonationReceiptEmailPayload,
} from "@/lib/email/templates/donation-receipt";

export type QueueEmailParams = {
  recipient: string;
  subject?: string;
  eventType: "programme.registration" | "donation.confirmation" | string;
  payload: Record<string, unknown>;
};

/**
 * Persists an email intent to the Outbox collection and immediately triggers
 * non-blocking asynchronous dispatch in the background.
 */
export async function queueOutboxEmail({
  recipient,
  subject,
  eventType,
  payload,
}: QueueEmailParams): Promise<{ ok: boolean; outboxId?: string; error?: string }> {
  if (!recipient || !hasValidMongoUri()) {
    return { ok: false, error: "Database or recipient not available." };
  }

  try {
    await connectToDatabase();

    const finalSubject =
      subject ||
      (eventType === "programme.registration"
        ? `Registration Confirmed: ${String(payload.programmeTitle || "Programme")}`
        : "Notification from Scan My Record");

    const outbox = await Outbox.create({
      recipient: recipient.trim().toLowerCase(),
      subject: finalSubject,
      eventType,
      payload,
      status: "pending",
      attempts: 0,
    });

    const outboxId = String(outbox._id);

    // Trigger non-blocking async dispatch
    setImmediate(async () => {
      try {
        await processOutboxJob(outboxId);
      } catch (err) {
        console.error("Background outbox dispatch error:", err);
      }
    });

    return { ok: true, outboxId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to queue outbox email.";
    console.error("Outbox queue error:", message);
    return { ok: false, error: message };
  }
}

/**
 * Processes a single outbox job with atomic state locking to prevent duplicate sends.
 */
export async function processOutboxJob(outboxId: string): Promise<boolean> {
  if (!outboxId || !hasValidMongoUri()) {
    return false;
  }

  try {
    await connectToDatabase();

    // Atomic claim: only claim if pending or failed with < 5 attempts
    const job = (await Outbox.findOneAndUpdate(
      {
        _id: outboxId,
        status: { $in: ["pending", "failed"] },
        attempts: { $lt: 5 },
      },
      {
        status: "processing",
        lockedAt: new Date(),
      },
      { new: true },
    ).lean()) as IOutbox | null;

    if (!job) {
      return false; // Already claimed, sent, or max attempts reached
    }

    let renderedSubject = job.subject;
    let renderedHtml = "";
    let renderedText = "";

    if (job.eventType === "programme.registration") {
      const rendered = renderRegistrationConfirmationEmail(
        job.payload as unknown as RegistrationEmailPayload,
      );
      renderedSubject = rendered.subject;
      renderedHtml = rendered.html;
      renderedText = rendered.text;
    } else if (job.eventType === "donation.confirmation") {
      const rendered = renderDonationReceiptEmail(
        job.payload as unknown as DonationReceiptEmailPayload,
      );
      renderedSubject = rendered.subject;
      renderedHtml = rendered.html;
      renderedText = rendered.text;
    } else {
      renderedHtml = `<p>${job.subject}</p>`;
      renderedText = job.subject;
    }

    const result = await sendEmail({
      to: job.recipient,
      subject: renderedSubject,
      html: renderedHtml,
      text: renderedText,
    });

    if (result.success) {
      await Outbox.findByIdAndUpdate(job._id, {
        status: "sent",
        sentAt: new Date(),
        lastError: "",
      });
      return true;
    } else {
      await Outbox.findByIdAndUpdate(job._id, {
        status: "failed",
        $inc: { attempts: 1 },
        lastError: result.error || "Email delivery failed.",
      });
      return false;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Outbox processor error.";
    await Outbox.findByIdAndUpdate(outboxId, {
      status: "failed",
      $inc: { attempts: 1 },
      lastError: message,
    }).catch(() => {});
    return false;
  }
}

/**
 * Self-healing sweeper that processes all pending or retryable outbox jobs.
 */
export async function processAllPendingOutbox(limit = 20): Promise<{ processed: number; sent: number }> {
  if (!hasValidMongoUri()) {
    return { processed: 0, sent: 0 };
  }

  await connectToDatabase();

  const pendingJobs = (await Outbox.find({
    status: { $in: ["pending", "failed"] },
    attempts: { $lt: 5 },
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean()) as IOutbox[];

  let sent = 0;

  for (const job of pendingJobs) {
    const isSent = await processOutboxJob(String(job._id));
    if (isSent) {
      sent += 1;
    }
  }

  return { processed: pendingJobs.length, sent };
}
