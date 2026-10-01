import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import { createRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { loginSchema } from "@/lib/validation/auth.schema";
import User from "@/models/User";

const adminEmail = process.env.ADMIN_EMAIL?.trim();
const adminPassword = process.env.ADMIN_PASSWORD?.trim();

// 5 failed attempts per IP and per email within 15 minutes.
const failures = createRateLimiter(5, 15 * 60 * 1000);

function safeEqual(a: string, b: string) {
  const digest = (value: string) => crypto.createHash("sha256").update(value).digest();
  return crypto.timingSafeEqual(digest(a), digest(b));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const ipKey = `ip:${getClientIp(request)}`;
  const emailKey = `email:${email.toLowerCase()}`;

  const retryAfter = Math.max(failures.retryAfter(ipKey), failures.retryAfter(emailKey));

  if (retryAfter > 0) {
    return NextResponse.json(
      { message: "Too many failed attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const succeed = async (userId: string, role: string) => {
    failures.reset(ipKey);
    failures.reset(emailKey);
    await createSession(userId, role);
    return NextResponse.json({ ok: true });
  };

  if (
    adminEmail &&
    adminPassword &&
    safeEqual(email.toLowerCase(), adminEmail.toLowerCase()) &&
    safeEqual(password, adminPassword)
  ) {
    return succeed("admin-1", "SUPER_ADMIN");
  }

  if (hasValidMongoUri()) {
    try {
      await connectToDatabase();
      const dbUser = await User.findOne({ email: email.toLowerCase() }).lean();

      if (dbUser && dbUser.passwordHash && (await verifyPassword(dbUser.passwordHash, password))) {
        return succeed(String(dbUser._id), dbUser.role ?? "ADMIN");
      }
    } catch {
      // fall through to invalid credentials response below
    }
  }

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { message: "Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment." },
      { status: 500 },
    );
  }

  failures.recordFailure(ipKey);
  failures.recordFailure(emailKey);

  return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
}
