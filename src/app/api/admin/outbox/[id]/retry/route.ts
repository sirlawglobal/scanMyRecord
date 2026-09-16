import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { processOutboxJob } from "@/services/outbox.service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const success = await processOutboxJob(id);
    return NextResponse.json({ ok: success });
  } catch {
    return NextResponse.json({ message: "Failed to process outbox job" }, { status: 500 });
  }
}
