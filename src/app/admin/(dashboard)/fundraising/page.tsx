import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import FundraisingCampaign from "@/models/FundraisingCampaign";
import { DeleteActionButton } from "@/components/admin/DeleteActionButton";

type CampaignRow = {
  _id: string;
  title: string;
  raisedAmount: number;
  targetAmount: number;
  status: string;
};

export default async function AdminFundraisingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  let campaigns: CampaignRow[] = [];

  if (hasValidMongoUri()) {
    await connectToDatabase();
    const docs = await FundraisingCampaign.find({}).sort({ createdAt: -1 }).lean();
    campaigns = docs.map((doc) => ({
      _id: String(doc._id),
      title: doc.title,
      raisedAmount: doc.raisedAmount ?? 0,
      targetAmount: doc.targetAmount ?? 0,
      status: doc.status,
    }));
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Finance</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">Fundraising</h1>
          </div>
          <Link href="/admin/fundraising/new" className="rounded-full bg-navy-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-navy-800">
            New campaign
          </Link>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Campaign</th>
                <th className="px-5 py-4">Raised</th>
                <th className="px-5 py-4">Target</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                    No campaigns yet. Create one above.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign._id} className="border-t border-slate-200 hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <Link href={`/admin/fundraising/${campaign._id}/edit`} className="hover:text-gold-600 hover:underline">
                        {campaign.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-600">₦{campaign.raisedAmount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-600">₦{campaign.targetAmount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          campaign.status === "active"
                            ? "bg-green-100 text-green-700"
                            : campaign.status === "closed"
                              ? "bg-slate-200 text-slate-700"
                              : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/fundraising/${campaign._id}/donations`}
                          className="text-xs font-semibold text-brand-600 hover:underline"
                        >
                          Donations
                        </Link>
                        <Link
                          href={`/admin/fundraising/${campaign._id}/edit`}
                          className="text-xs font-semibold text-navy-900 hover:text-gold-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteActionButton
                          endpoint={`/api/admin/fundraising/${campaign._id}`}
                          itemName="campaign"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
