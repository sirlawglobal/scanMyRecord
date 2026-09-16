import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import Politician from "@/models/Politician";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const politician = await Politician.findOne({}).sort({ createdAt: -1 });

  return NextResponse.json(politician);
}

export async function PATCH(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));

    await connectToDatabase();

    const updated = await Politician.findOneAndUpdate({}, body, { new: true, upsert: true, runValidators: true }).catch(
      () => null,
    );

    if (!updated) {
      return NextResponse.json({ message: "Failed to update profile. Check the submitted fields." }, { status: 400 });
    }

    await AuditLog.create({
      userId: session.sub,
      action: "politician.update",
      entity: "Politician",
      entityId: updated._id,
      details: body,
    }).catch(() => {});

    try {
      const { revalidatePath } = await import("next/cache");
      revalidatePath("/");
      revalidatePath("/admin/profile");
    } catch {}

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Failed to update profile." }, { status: 500 });
  }
}
