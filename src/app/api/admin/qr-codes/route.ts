import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { createQRCode, type QrTargetType } from "@/services/qr.service";
import Politician from "@/models/Politician";

const ALLOWED_TARGET_TYPES: QrTargetType[] = ["politician", "project", "programme", "fundraising"];

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const targetType = body?.targetType;
    const targetId = body?.targetId;

    if (!ALLOWED_TARGET_TYPES.includes(targetType) || typeof targetId !== "string" || targetId.trim().length === 0) {
      return NextResponse.json({ message: "A valid targetType and targetId are required." }, { status: 400 });
    }

    await connectToDatabase();
    const politician = await Politician.findOne({}).sort({ createdAt: -1 });

    if (!politician) {
      return NextResponse.json({ message: "No politician profile found." }, { status: 400 });
    }

    const qrCode = await createQRCode(String(politician._id), targetType as QrTargetType, targetId);

    return NextResponse.json(qrCode, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create QR code." }, { status: 500 });
  }
}
