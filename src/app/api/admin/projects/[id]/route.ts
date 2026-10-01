import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import Project from "@/models/Project";
import AuditLog from "@/models/AuditLog";
import { isValidObjectId } from "mongoose";
import { firstIssue, projectUpdateSchema } from "@/lib/validation/admin.schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Project not found." }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = projectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: firstIssue(parsed.error) }, { status: 400 });
    }

    const { media, ...fields } = parsed.data;
    const update: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        update[key] = value;
      }
    }

    if (media !== undefined) {
      const normalizedMedia = media.map((item) => ({
        url: item.url,
        type: item.type ?? "image",
        stage: item.stage ?? "general",
        caption: item.caption ?? "",
      }));

      update.media = normalizedMedia;
      update.images = normalizedMedia.filter((item) => item.type !== "video").map((item) => item.url);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: "No changes were submitted." }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await Project.findByIdAndUpdate(id, update, { new: true, runValidators: true }).catch(() => null);

    if (!updated) {
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }

    await AuditLog.create({
      userId: session.sub,
      action: "project.update",
      entity: "Project",
      entityId: updated._id,
      details: update,
    }).catch(() => {});

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Failed to update project." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Project not found." }, { status: 404 });
  }

  try {
    await connectToDatabase();

    const archived = await Project.findByIdAndUpdate(id, { archived: true }, { new: true }).catch(() => null);

    if (!archived) {
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }

    await AuditLog.create({
      userId: session.sub,
      action: "project.archive",
      entity: "Project",
      entityId: archived._id,
      details: {},
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Failed to archive project." }, { status: 500 });
  }
}
