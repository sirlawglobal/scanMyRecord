import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { disableQRCode } from "@/services/qr.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const updated = await disableQRCode(id);

    if (!updated) {
      return NextResponse.json({ message: "QR code not found." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Failed to disable QR code." }, { status: 500 });
  }
}
