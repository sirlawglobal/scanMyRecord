import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import FundraisingCampaign from "@/models/FundraisingCampaign";
import Donation from "@/models/Donation";

type DonationRow = {
  _id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  status: string;
  reference: string;
  createdAt: string;
};

export default async function AdminCampaignDonationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;

  let campaignTitle = "Campaign";
  let donations: DonationRow[] = [];

  if (hasValidMongoUri()) {
    await connectToDatabase();

    const campaign = await FundraisingCampaign.findById(id).lean();

    if (campaign) {
      campaignTitle = campaign.title;
    }

    const docs = await Donation.find({ campaignId: id }).sort({ createdAt: -1 }).lean();
    donations = docs.map((doc) => ({
      _id: String(doc._id),
      donorName: doc.donorName,
      donorEmail: doc.donorEmail,
      amount: doc.amount,
      status: doc.status,
      reference: doc.reference,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleString() : "",
    }));
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Finance</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">{campaignTitle} — Donations</h1>
          </div>
          <Link href="/admin/fundraising" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
            Back to campaigns
          </Link>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Donor</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-slate-500" colSpan={5}>
                    No donations yet.
                  </td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation._id} className="border-t border-slate-200">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {donation.donorName}
                      <div className="font-normal text-slate-500">{donation.donorEmail}</div>
                    </td>
                    <td className="px-5 py-4">₦{donation.amount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          donation.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : donation.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">{donation.reference}</td>
                    <td className="px-5 py-4">{donation.createdAt}</td>
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
