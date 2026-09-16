import { NextResponse } from "next/server";
import { processAllPendingOutbox } from "@/services/outbox.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || 20);

    const result = await processAllPendingOutbox(limit);

    return NextResponse.json({
      ok: true,
      message: `Processed ${result.processed} pending outbox jobs (${result.sent} sent).`,
      result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sweeper execution failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
