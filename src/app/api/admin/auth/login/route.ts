import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import User from "@/models/User";

const adminEmail = process.env.ADMIN_EMAIL?.trim();
const adminPassword = process.env.ADMIN_PASSWORD?.trim();

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  if (adminEmail && adminPassword && email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword) {
    await createSession("admin-1", "SUPER_ADMIN");
    return NextResponse.json({ ok: true });
  }

  if (hasValidMongoUri()) {
    try {
      await connectToDatabase();
      const dbUser = await User.findOne({ email: email.toLowerCase() }).lean();

      if (dbUser && dbUser.passwordHash && (await verifyPassword(dbUser.passwordHash, password))) {
        await createSession(String(dbUser._id), dbUser.role ?? "SUPER_ADMIN");
        return NextResponse.json({ ok: true });
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

  return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
}
