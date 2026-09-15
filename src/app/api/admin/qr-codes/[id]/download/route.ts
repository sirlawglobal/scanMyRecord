import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { downloadQRAsset } from "@/services/qr.service";
import QRCodeModel from "@/models/QRCode";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await connectToDatabase();
  const qrCode = await QRCodeModel.findById(id).lean<{ code: string } | null>();

  if (!qrCode) {
    return NextResponse.json({ message: "QR code not found." }, { status: 404 });
  }

  const buffer = await downloadQRAsset(qrCode.code);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${qrCode.code}.png"`,
    },
  });
}
