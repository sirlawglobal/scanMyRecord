import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import FundraisingCampaign from "@/models/FundraisingCampaign";
import Donation from "@/models/Donation";
import AuditLog from "@/models/AuditLog";

const ALLOWED_FIELDS = ["title", "description", "targetAmount", "status", "imageUrl"] as const;

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
        if (field === "targetAmount") {
          const num = Number(body[field]);
          if (!Number.isFinite(num) || num <= 0) {
            return NextResponse.json({ message: "Target amount must be a positive number." }, { status: 400 });
          }
          update[field] = num;
        } else {
          update[field] = body[field];
        }
      }
    }

    await connectToDatabase();

    const updated = await FundraisingCampaign.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).catch(() => null);

    if (!updated) {
      return NextResponse.json({ message: "Campaign not found." }, { status: 404 });
    }

    await AuditLog.create({
      userId: session.sub,
      action: "fundraising.update",
      entity: "FundraisingCampaign",
      entityId: updated._id,
      details: update,
    }).catch(() => {});

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Failed to update campaign." }, { status: 500 });
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

    const donationCount = await Donation.countDocuments({ campaignId: id });

    if (donationCount > 0) {
      return NextResponse.json(
        { message: "This campaign has donation records and can't be deleted. Set its status to \"closed\" instead." },
        { status: 409 },
      );
    }

    const deleted = await FundraisingCampaign.findByIdAndDelete(id).catch(() => null);

    if (!deleted) {
      return NextResponse.json({ message: "Campaign not found." }, { status: 404 });
    }

    await AuditLog.create({
      userId: session.sub,
      action: "fundraising.delete",
      entity: "FundraisingCampaign",
      entityId: deleted._id,
      details: { title: deleted.title },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Failed to delete campaign." }, { status: 500 });
  }
}
