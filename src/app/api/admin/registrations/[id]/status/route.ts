import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import Registration from "@/models/Registration";

const ALLOWED_STATUSES = ["approved", "rejected", "pending"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const status = body?.status;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ message: "A valid status is required." }, { status: 400 });
    }

    await connectToDatabase();
    const registration = await Registration.findByIdAndUpdate(id, { status }, { new: true });

    if (!registration) {
      return NextResponse.json({ message: "Registration not found." }, { status: 404 });
    }

    return NextResponse.json(registration);
  } catch {
    return NextResponse.json({ message: "Failed to update registration." }, { status: 500 });
  }
}
