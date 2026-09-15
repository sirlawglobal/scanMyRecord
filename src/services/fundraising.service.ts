import { z } from "zod";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import { getPaymentProvider } from "@/lib/payments/factory";
import Donation from "@/models/Donation";
import FundraisingCampaign from "@/models/FundraisingCampaign";

export const donationSchema = z.object({
  donorName: z.string().trim().min(2, "Donor name is required."),
  donorEmail: z.string().trim().email("A valid email is required."),
  amount: z.coerce.number().int().positive("Amount must be greater than zero."),
  campaignSlug: z.string().trim().min(2, "Campaign is required."),
  anonymous: z.boolean().default(false),
});

export type DonationInput = z.infer<typeof donationSchema>;

export function createDonationReference(year = new Date().getFullYear()) {
  const sequence = Math.floor(Math.random() * 900000) + 100000;
  return `SMR-DON-${year}-${sequence}`;
}

export function validateDonationInput(data: unknown) {
  return donationSchema.safeParse(data);
}

export function buildDonationCallbackUrl(campaignSlug: string) {
  return `/fundraising/${campaignSlug}/contribute/verify?ref=__REF__`;
}

export function createDonationPayload(data: unknown) {
  const parsed = validateDonationInput(data);

  if (!parsed.success) {
    throw new z.ZodError(parsed.error.issues);
  }

  return {
    ...parsed.data,
    reference: createDonationReference(),
  };
}

export type CreateDonationResult =
  | { ok: true; reference: string; authorizationUrl: string }
  | { ok: false; error: string };

/**
 * Creates a pending Donation record and initializes payment with the
 * configured provider. `amountRaised` on the campaign is NOT touched here —
 * it is only ever incremented by the payment webhook, after verification.
 */
export async function createDonation(data: unknown): Promise<CreateDonationResult> {
  const parsed = validateDonationInput(data);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid donation data." };
  }

  if (!hasValidMongoUri()) {
    return { ok: false, error: "Donations are not available right now. Please try again later." };
  }

  await connectToDatabase();

  const campaign = await FundraisingCampaign.findOne({ slug: parsed.data.campaignSlug });

  if (!campaign || campaign.status !== "active") {
    return { ok: false, error: "This fundraising campaign is not accepting contributions." };
  }

  let reference = createDonationReference();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await Donation.create({
        campaignId: campaign._id,
        reference,
        donorName: parsed.data.anonymous ? "Anonymous" : parsed.data.donorName,
        donorEmail: parsed.data.donorEmail,
        amount: parsed.data.amount,
        status: "pending",
      });
      break;
    } catch (error) {
      const mongoError = error as { code?: number };

      if (mongoError?.code === 11000 && attempt < 2) {
        reference = createDonationReference();
        continue;
      }

      throw error;
    }
  }

  const callbackUrl = buildDonationCallbackUrl(campaign.slug).replace("__REF__", reference);

  const { authorizationUrl } = await getPaymentProvider().initializePayment({
    amount: parsed.data.amount,
    email: parsed.data.donorEmail,
    reference,
    callbackUrl,
  });

  await Donation.updateOne({ reference }, { paymentReference: reference });

  return { ok: true, reference, authorizationUrl };
}

/**
 * Idempotently verifies a donation's payment status with the provider and,
 * only on first successful verification, atomically increments the
 * campaign's raisedAmount.
 */
export async function verifyAndCompleteDonation(reference: string) {
  if (!reference || !hasValidMongoUri()) {
    return { ok: false as const, error: "Donation not found." };
  }

  await connectToDatabase();

  const donation = await Donation.findOne({ reference });

  if (!donation) {
    return { ok: false as const, error: "Donation not found." };
  }

  if (donation.status === "paid") {
    return { ok: true as const, status: "paid" as const, amount: donation.amount };
  }

  const verification = await getPaymentProvider().verifyPayment(donation.paymentReference ?? reference);

  if (verification.status !== "success") {
    if (verification.status === "failed") {
      await Donation.updateOne({ _id: donation._id, status: { $ne: "paid" } }, { status: "failed" });
    }

    return { ok: true as const, status: verification.status, amount: donation.amount };
  }

  const updateResult = await Donation.updateOne({ _id: donation._id, status: { $ne: "paid" } }, { status: "paid" });

  if (updateResult.modifiedCount > 0) {
    await FundraisingCampaign.updateOne({ _id: donation.campaignId }, { $inc: { raisedAmount: donation.amount } });
  }

  return { ok: true as const, status: "paid" as const, amount: donation.amount };
}

export async function getFundraisingStats(campaignSlug: string) {
  if (!campaignSlug || !hasValidMongoUri()) {
    return null;
  }

  await connectToDatabase();

  const campaign = await FundraisingCampaign.findOne({ slug: campaignSlug }).lean();

  if (!campaign) {
    return null;
  }

  const donationCount = await Donation.countDocuments({ campaignId: campaign._id, status: "paid" });

  return {
    targetAmount: campaign.targetAmount,
    raisedAmount: campaign.raisedAmount,
    donationCount,
  };
}
