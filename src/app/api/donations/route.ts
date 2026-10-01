import { NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { createDonation } from "@/services/fundraising.service";

const MAX_BODY_BYTES = 5 * 1024;

// Each request creates a pending donation record and a Paystack session, so
// unthrottled use would let a bot flood the database and the payment gateway.
const perIp = createRateLimiter(10, 15 * 60 * 1000);

export async function POST(request: Request) {
  try {
    const ipKey = getClientIp(request);
    const retryAfter = perIp.retryAfter(ipKey);

    if (retryAfter > 0) {
      return NextResponse.json(
        { message: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    perIp.record(ipKey);

    const raw = await request.text();

    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "Request is too large." }, { status: 413 });
    }

    let body: unknown = {};

    try {
      body = JSON.parse(raw);
    } catch {
      // validation below reports the problem
    }

    const result = await createDonation(body);

    if (!result.ok) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({ reference: result.reference, authorizationUrl: result.authorizationUrl }, { status: 201 });
  } catch (error) {
    console.error("Donation request failed", error);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
