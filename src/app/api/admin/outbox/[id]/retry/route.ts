import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Outbox from "@/models/Outbox";
import { processOutboxJob } from "@/services/outbox.service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!hasValidMongoUri()) {
    return NextResponse.json({ message: "Database not available" }, { status: 500 });
  }

  try {
    await connectToDatabase();

    // Admin forced retry: reset status to "pending" and clear attempts so
    // processOutboxJob can claim and re-dispatch it regardless of prior status
    // (including already "sent" mock-mode records).
    await Outbox.findByIdAndUpdate(id, {
      status: "pending",
      attempts: 0,
      lastError: "",
      lockedAt: null,
      sentAt: null,
    });

    const success = await processOutboxJob(id);
    return NextResponse.json({ ok: success });
  } catch {
    return NextResponse.json({ message: "Failed to process outbox job" }, { status: 500 });
  }
}
