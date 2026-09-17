import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import Project from "@/models/Project";
import AuditLog from "@/models/AuditLog";

const ALLOWED_FIELDS = ["title", "summary", "category", "status", "year", "location"] as const;

type MediaItemInput = { url: string; type?: string; stage?: string; caption?: string };

function normalizeMedia(media: unknown): MediaItemInput[] | null {
  if (!Array.isArray(media)) {
    return null;
  }

  const normalized: MediaItemInput[] = [];

  for (const item of media) {
    if (!item || typeof item !== "object" || typeof (item as { url?: unknown }).url !== "string") {
      return null;
    }

    const record = item as Record<string, unknown>;
    normalized.push({
      url: record.url as string,
      type: record.type === "video" ? "video" : "image",
      stage: ["before", "after"].includes(String(record.stage)) ? (record.stage as string) : "general",
      caption: typeof record.caption === "string" ? record.caption : "",
    });
  }

  return normalized;
}

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
        update[field] = field === "year" ? Number(body[field]) : body[field];
      }
    }

    if (body?.media !== undefined) {
      const normalizedMedia = normalizeMedia(body.media);

      if (normalizedMedia === null) {
        return NextResponse.json({ message: "Media must be an array of { url, type, stage } items." }, { status: 400 });
      }

      update.media = normalizedMedia;
      update.images = normalizedMedia.filter((item) => item.type !== "video").map((item) => item.url);
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
