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

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { title, summary, category, status, year, location, images } = body ?? {};

    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ message: "Title is required." }, { status: 400 });
    }

    if (typeof category !== "string" || category.trim().length === 0) {
      return NextResponse.json({ message: "Category is required." }, { status: 400 });
    }

    if (images !== undefined && (!Array.isArray(images) || !images.every((item) => typeof item === "string"))) {
      return NextResponse.json({ message: "Images must be an array of URLs." }, { status: 400 });
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
        images: Array.isArray(images) ? images : [],
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
