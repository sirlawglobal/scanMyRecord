import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import Programme from "@/models/Programme";
import Politician from "@/models/Politician";
import { slugify, uniqueSlug } from "@/lib/slug";
import { firstIssue, programmeCreateSchema } from "@/lib/validation/admin.schema";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = programmeCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: firstIssue(parsed.error) }, { status: 400 });
    }

    const { title, description, capacity, registrationDeadline, registrationOpen, images } = parsed.data;
    const category = parsed.data.category || "Youth Empowerment";

    const baseSlug = slugify(title);

    if (!baseSlug) {
      return NextResponse.json({ message: "Title must contain letters or numbers." }, { status: 400 });
    }

    await connectToDatabase();

    const politician = await Politician.findOne({}).sort({ createdAt: -1 });

    if (!politician) {
      return NextResponse.json({ message: "No politician profile found." }, { status: 400 });
    }

    const slug = await uniqueSlug(async (candidate) => Boolean(await Programme.exists({ slug: candidate })), baseSlug);

    const programme = await Programme.create({
      politicianId: politician._id,
      title,
      slug,
      description: description ?? "",
      category,
      status: "active",
      registrationOpen: registrationOpen ?? false,
      capacity: capacity ?? null,
      registrationDeadline: registrationDeadline ?? null,
      images: images ?? [],
    });

    return NextResponse.json(programme, { status: 201 });
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) {
      return NextResponse.json({ message: "A programme with this title already exists. Try again." }, { status: 409 });
    }

    return NextResponse.json({ message: "Failed to create programme." }, { status: 500 });
  }
}
