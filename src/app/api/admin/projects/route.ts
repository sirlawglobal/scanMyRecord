import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import Project from "@/models/Project";
import Politician from "@/models/Politician";
import AuditLog from "@/models/AuditLog";

function slugify(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type MediaItemInput = { url: string; type?: string; stage?: string; caption?: string };

function normalizeMedia(media: unknown): MediaItemInput[] | null {
  if (media === undefined) {
    return [];
  }

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

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { title, summary, category, status, year, location, media } = body ?? {};

    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ message: "Title is required." }, { status: 400 });
    }

    if (typeof category !== "string" || category.trim().length === 0) {
      return NextResponse.json({ message: "Category is required." }, { status: 400 });
    }

    const normalizedMedia = normalizeMedia(media);

    if (normalizedMedia === null) {
      return NextResponse.json({ message: "Media must be an array of { url, type, stage } items." }, { status: 400 });
    }

    await connectToDatabase();

    const politician = await Politician.findOne({}).sort({ createdAt: -1 });

    if (!politician) {
      return NextResponse.json({ message: "No politician profile found." }, { status: 400 });
    }

    const slug = slugify(title);

    let created;

    try {
      created = await Project.create({
        politicianId: politician._id,
        title,
        slug,
        summary: summary ?? "",
        category,
        status: status ?? "proposed",
        year: year !== undefined && year !== null && year !== "" ? Number(year) : undefined,
        location: location ?? "",
        media: normalizedMedia,
        images: normalizedMedia.filter((item) => item.type !== "video").map((item) => item.url),
      });
    } catch {
      return NextResponse.json({ message: "Failed to create project. Check the submitted fields." }, { status: 400 });
    }

    await AuditLog.create({
      userId: session.sub,
      action: "project.create",
      entity: "Project",
      entityId: created._id,
      details: { title },
    }).catch(() => {});

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create project." }, { status: 500 });
  }
}
