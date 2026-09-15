import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import FundraisingCampaign from "@/models/FundraisingCampaign";
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
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const targetAmount = Number(body?.targetAmount);
    const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";

    if (title.length < 2) {
      return NextResponse.json({ message: "Campaign title is required." }, { status: 400 });
    }

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      return NextResponse.json({ message: "Target amount must be greater than zero." }, { status: 400 });
    }

    await connectToDatabase();

    const politician = await Politician.findOne({}).sort({ createdAt: -1 });

    if (!politician) {
      return NextResponse.json({ message: "No politician profile found." }, { status: 400 });
    }

    const slug = slugify(title);

    const campaign = await FundraisingCampaign.create({
      politicianId: politician._id,
      title,
      slug,
      description,
      targetAmount,
      raisedAmount: 0,
      status: "active",
      imageUrl,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Failed to create campaign." }, { status: 500 });
  }
}
