import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import Programme from "@/models/Programme";
import AuditLog from "@/models/AuditLog";

const ALLOWED_FIELDS = [
  "title",
  "description",
  "category",
  "status",
  "registrationOpen",
  "capacity",
  "registrationDeadline",
  "images",
] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json().catch(() => ({}));
    const update: Record<string, unknown> = {};

    for (const field of ALLOWED_FIELDS) {
      if (body?.[field] !== undefined) {
        if (field === "capacity") {
          update[field] = body[field] === "" || body[field] === null ? null : Number(body[field]);
        } else if (field === "registrationDeadline") {
          update[field] = body[field] ? new Date(body[field]) : null;
        } else if (field === "registrationOpen") {
          update[field] = Boolean(body[field]);
        } else {
          update[field] = body[field];
        }
      }
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
