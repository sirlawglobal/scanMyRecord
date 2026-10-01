import { NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { createRegistration, generateRegistrationReference } from "@/services/registration.service";

const MAX_BODY_BYTES = 20 * 1024;

// Every submission counts (not just failures): each one can trigger an email to
// an address the visitor typed, so unthrottled use would let the form mail-bomb
// a third party or fill a programme's capacity.
const perIp = createRateLimiter(10, 60 * 60 * 1000);
const perEmail = createRateLimiter(3, 60 * 60 * 1000);

function tooMany(retryAfter: number) {
  return NextResponse.json(
    { message: "Too many registration attempts. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const raw = await request.text();

    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "Request is too large." }, { status: 413 });
    }

    let body: Record<string, unknown> = {};

    try {
      const parsed = JSON.parse(raw);
      body = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
      // handled by validation below
    }

    const ipKey = `ip:${getClientIp(request)}`;
    const emailKey = typeof body.email === "string" ? `email:${slug}:${body.email.trim().toLowerCase()}` : null;

    const retryAfter = Math.max(perIp.retryAfter(ipKey), emailKey ? perEmail.retryAfter(emailKey) : 0);

    if (retryAfter > 0) {
      return tooMany(retryAfter);
    }

    perIp.record(ipKey);
    if (emailKey) perEmail.record(emailKey);

    // Honeypot filled in: pretend it worked so bots do not adapt, store nothing.
    if (typeof body.website === "string" && body.website.trim() !== "") {
      return NextResponse.json({ reference: generateRegistrationReference() }, { status: 201 });
    }

    const result = await createRegistration(slug, body);

    if (!result.ok) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({ reference: result.reference }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
