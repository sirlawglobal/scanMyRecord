import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import Programme from "@/models/Programme";
import AuditLog from "@/models/AuditLog";
import { isValidObjectId } from "mongoose";
import { firstIssue, programmeUpdateSchema } from "@/lib/validation/admin.schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Programme not found." }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = programmeUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: firstIssue(parsed.error) }, { status: 400 });
    }

    // Only fields the client actually sent; `null` is meaningful (clears capacity/deadline).
    const update = Object.fromEntries(Object.entries(parsed.data).filter(([, value]) => value !== undefined));

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: "No changes were submitted." }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await Programme.findByIdAndUpdate(id, update, { new: true, runValidators: true }).catch(() => null);

    if (!updated) {
      return NextResponse.json({ message: "Programme not found." }, { status: 404 });
    }

    await AuditLog.create({
      userId: session.sub,
      action: "programme.update",
      entity: "Programme",
      entityId: updated._id,
      details: update,
    }).catch(() => {});

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Failed to update programme." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Programme not found." }, { status: 404 });
  }

  try {
    await connectToDatabase();

    const deleted = await Programme.findByIdAndDelete(id).catch(() => null);

    if (!deleted) {
      return NextResponse.json({ message: "Programme not found." }, { status: 404 });
    }

    await AuditLog.create({
      userId: session.sub,
      action: "programme.delete",
      entity: "Programme",
      entityId: deleted._id,
      details: { title: deleted.title },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Failed to delete programme." }, { status: 500 });
  }
}
