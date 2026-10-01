import { NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { getRegistrationByReference } from "@/services/registration.service";

const lookups = createRateLimiter(20, 15 * 60 * 1000);

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const ipKey = getClientIp(request);
  const retryAfter = lookups.retryAfter(ipKey);

  if (retryAfter > 0) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  lookups.record(ipKey);

  const { reference } = await params;
  const email = new URL(request.url).searchParams.get("email") ?? "";
  const registration = await getRegistrationByReference(reference, email);

  if (!registration) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(registration);
}
