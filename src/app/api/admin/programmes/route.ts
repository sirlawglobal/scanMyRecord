import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import Programme from "@/models/Programme";
import Politician from "@/models/Politician";

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
    const title = typeof body?.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json({ message: "A programme title is required." }, { status: 400 });
    }

    const description = typeof body?.description === "string" ? body.description : "";

    const capacity =
      body?.capacity === "" || body?.capacity === null || body?.capacity === undefined
        ? null
        : Number(body.capacity);

    if (capacity !== null && (!Number.isFinite(capacity) || capacity < 0)) {
      return NextResponse.json({ message: "Capacity must be a positive number." }, { status: 400 });
    }

    const registrationDeadline =
      body?.registrationDeadline === "" || body?.registrationDeadline === null || body?.registrationDeadline === undefined
        ? null
        : new Date(body.registrationDeadline);

    if (registrationDeadline !== null && Number.isNaN(registrationDeadline.getTime())) {
      return NextResponse.json({ message: "Invalid registration deadline." }, { status: 400 });
    }

    const registrationOpen = Boolean(body?.registrationOpen);

    const images = body?.images;

    if (images !== undefined && (!Array.isArray(images) || !images.every((item) => typeof item === "string"))) {
      return NextResponse.json({ message: "Images must be an array of URLs." }, { status: 400 });
    }

    const slug = slugify(title);

    if (!slug) {
      return NextResponse.json({ message: "A valid programme title is required." }, { status: 400 });
    }

    await connectToDatabase();

    const politician = await Politician.findOne({}).sort({ createdAt: -1 });

    if (!politician) {
      return NextResponse.json({ message: "No politician profile found." }, { status: 400 });
    }

    const programme = await Programme.create({
      politicianId: politician._id,
      title,
      slug,
      description,
      status: "active",
      registrationOpen,
      capacity,
      registrationDeadline,
      images: Array.isArray(images) ? images : [],
    });

    return NextResponse.json(programme, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create programme." }, { status: 500 });
  }
}
