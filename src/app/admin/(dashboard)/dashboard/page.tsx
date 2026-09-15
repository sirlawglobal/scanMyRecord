import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Registration from "@/models/Registration";
import Donation from "@/models/Donation";
import FundraisingCampaign from "@/models/FundraisingCampaign";
import QRScan from "@/models/QRScan";

async function getStats() {
  if (!hasValidMongoUri()) {
    return {
      registrations: 0,
      donations: "₦0",
      activeCampaigns: 0,
      qrScans: 0,
    };
  }

  await connectToDatabase();

  const [registrations, donationAgg, activeCampaigns, qrScans] = await Promise.all([
    Registration.countDocuments({}),
    Donation.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    FundraisingCampaign.countDocuments({ status: "active" }),
    QRScan.countDocuments({}),
  ]);

  const totalDonations = donationAgg[0]?.total ?? 0;

  return {
    registrations,
    donations: `₦${totalDonations.toLocaleString()}`,
    activeCampaigns,
    qrScans,
  };
}

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { registrations, donations, activeCampaigns, qrScans } = await getStats();

  const stats = [
    { label: "Registrations", value: registrations.toLocaleString() },
    { label: "Donations", value: donations },
    { label: "Active campaigns", value: activeCampaigns.toLocaleString() },
    { label: "QR scans", value: qrScans.toLocaleString() },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Admin</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">Dashboard</h1>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">Role: {session.role}</div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-black text-gold-500">{stat.value}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
