import { NextRequest, NextResponse } from "next/server";
import { resolveQRCode, recordScanAsync } from "@/services/qr.service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const resolved = await resolveQRCode(code);

  if (!resolved) {
    return NextResponse.redirect(new URL("/q/invalid", request.url));
  }

  void recordScanAsync(resolved.id, request.headers.get("user-agent") ?? "");

  return NextResponse.redirect(new URL(resolved.targetUrl, request.url));
}
