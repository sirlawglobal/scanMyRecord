import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/factory";
import { verifyAndCompleteDonation } from "@/services/fundraising.service";
import AuditLog from "@/models/AuditLog";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const result = await getPaymentProvider().handleWebhook(rawBody, signature);

  if (!result.valid) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  if (result.status === "success") {
    try {
      await verifyAndCompleteDonation(result.reference);
    } catch (error) {
      console.error("Failed to complete donation from webhook", error);
    }

    try {
      await AuditLog.create({
        action: "webhook.payment.success",
        entity: "Donation",
        details: { reference: result.reference, amount: result.amount },
      });
    } catch (error) {
      console.error("Failed to write audit log for webhook", error);
    }
  }

  return NextResponse.json({ received: true });
}
