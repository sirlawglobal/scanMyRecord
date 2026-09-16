import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import FundraisingCampaign from "@/models/FundraisingCampaign";
import { EditCampaignForm } from "./EditCampaignForm";

export default async function AdminEditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;

  if (!hasValidMongoUri()) {
    notFound();
  }

  await connectToDatabase();
  const campaign = await FundraisingCampaign.findById(id).lean();

  if (!campaign) {
    notFound();
  }

  const serializedCampaign = {
    _id: String(campaign._id),
    title: String(campaign.title ?? ""),
    description: String(campaign.description ?? ""),
    targetAmount: Number(campaign.targetAmount ?? 0),
    raisedAmount: Number(campaign.raisedAmount ?? 0),
    status: String(campaign.status ?? "active"),
    imageUrl: String(campaign.imageUrl ?? ""),
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-elevated">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Fundraising</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">Edit Campaign</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/fundraising/${serializedCampaign._id}/donations`}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              View Donations →
            </Link>
            <Link
              href="/admin/fundraising"
              className="text-xs font-bold text-slate-500 hover:text-navy-900"
            >
              ← Back
            </Link>
          </div>
        </div>

        <EditCampaignForm campaign={serializedCampaign} />
      </div>
    </main>
  );
}
