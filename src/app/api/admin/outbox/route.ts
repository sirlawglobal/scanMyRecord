import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Outbox from "@/models/Outbox";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasValidMongoUri()) {
    return NextResponse.json({ outbox: [], counts: { total: 0, pending: 0, sent: 0, failed: 0 } });
  }

  await connectToDatabase();

  const [outbox, pending, sent, failed, total] = await Promise.all([
    Outbox.find({}).sort({ createdAt: -1 }).limit(50).lean(),
    Outbox.countDocuments({ status: "pending" }),
    Outbox.countDocuments({ status: "sent" }),
    Outbox.countDocuments({ status: "failed" }),
    Outbox.countDocuments({}),
  ]);

  const isSmtpConfigured = Boolean(
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim()
  );

  return NextResponse.json({
    outbox,
    counts: { total, pending, sent, failed },
    isSmtpConfigured,
  });
}
