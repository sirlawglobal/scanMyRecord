import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import Project from "@/models/Project";
import Politician from "@/models/Politician";
import AuditLog from "@/models/AuditLog";
import { slugify, uniqueSlug } from "@/lib/slug";
import { firstIssue, projectCreateSchema } from "@/lib/validation/admin.schema";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = projectCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: firstIssue(parsed.error) }, { status: 400 });
    }

    const { title, summary, category, status, year, location } = parsed.data;
    const media = (parsed.data.media ?? []).map((item) => ({
      url: item.url,
      type: item.type ?? "image",
      stage: item.stage ?? "general",
      caption: item.caption ?? "",
    }));

    const baseSlug = slugify(title);

    if (!baseSlug) {
      return NextResponse.json({ message: "Title must contain letters or numbers." }, { status: 400 });
    }

    await connectToDatabase();

    const politician = await Politician.findOne({}).sort({ createdAt: -1 });

    if (!politician) {
      return NextResponse.json({ message: "No politician profile found." }, { status: 400 });
    }

    const slug = await uniqueSlug(async (candidate) => Boolean(await Project.exists({ slug: candidate })), baseSlug);

    let created;

    try {
      created = await Project.create({
        politicianId: politician._id,
        title,
        slug,
        summary: summary ?? "",
        category,
        status: status ?? "ongoing",
        year,
        location: location ?? "",
        media,
        images: media.filter((item) => item.type !== "video").map((item) => item.url),
      });
    } catch (error) {
      if ((error as { code?: number })?.code === 11000) {
        return NextResponse.json({ message: "A project with this title already exists. Try again." }, { status: 409 });
      }

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
