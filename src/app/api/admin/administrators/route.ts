import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canAccess } from "@/lib/auth/rbac";
import { connectToDatabase } from "@/lib/db/connection";
import { hashPassword } from "@/lib/auth/password";
import User from "@/models/User";
import AuditLog from "@/models/AuditLog";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!canAccess(session.role as "ADMIN" | "SUPER_ADMIN", ["SUPER_ADMIN"])) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password, role } = body ?? {};

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ message: "Name is required." }, { status: 400 });
    }

    if (typeof email !== "string" || email.trim().length === 0) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
    }

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "A valid role is required." }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await User.findOne({ email: email.trim().toLowerCase() });

    if (existing) {
      return NextResponse.json({ message: "An administrator with this email already exists." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const created = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role,
    });

    await AuditLog.create({
      userId: session.sub,
      action: "user.create",
      entity: "User",
      entityId: created._id,
      details: { email: created.email, role: created.role },
    }).catch(() => {});

    const safeUser = created.toObject();
    delete safeUser.passwordHash;

    return NextResponse.json(safeUser, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create administrator." }, { status: 500 });
  }
}
