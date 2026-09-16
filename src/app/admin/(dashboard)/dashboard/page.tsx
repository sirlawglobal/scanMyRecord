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

const KPI_META = [
  {
    key: "registrations",
    label: "Total Registrations",
    description: "Programme sign-ups",
    color: "from-indigo-500/20 to-indigo-600/5",
    iconBg: "bg-indigo-500/15 text-indigo-400",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "donations",
    label: "Donations Raised",
    description: "From verified payments",
    color: "from-gold-500/20 to-gold-600/5",
    iconBg: "bg-gold-500/15 text-gold-400",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    key: "activeCampaigns",
    label: "Active Campaigns",
    description: "Currently fundraising",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    key: "qrScans",
    label: "QR Code Scans",
    description: "Verified public reach",
    color: "from-violet-500/20 to-violet-600/5",
    iconBg: "bg-violet-500/15 text-violet-400",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="5" />
        <rect x="16" y="3" width="5" height="5" />
        <rect x="3" y="16" width="5" height="5" />
        <path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M13 7h.01" />
      </svg>
    ),
  },
];

const QUICK_LINKS = [
  { href: "/admin/projects", label: "Manage Projects", icon: "🏗️" },
  { href: "/admin/programmes", label: "Manage Programmes", icon: "🏫" },
  { href: "/admin/fundraising", label: "Fundraising", icon: "💰" },
  { href: "/admin/qr-codes", label: "QR Codes", icon: "📱" },
  { href: "/admin/analytics", label: "Analytics", icon: "📊" },
  { href: "/admin/profile", label: "Edit Profile", icon: "✏️" },
];

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const stats = await getStats();

  const kpiCards = KPI_META.map((meta) => ({
    ...meta,
    value: String(stats[meta.key as keyof typeof stats]),
  }));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-gold-600">Admin</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back — here&apos;s your impact at a glance.</p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Role: <span className="font-semibold text-navy-900">{session.role}</span>
        </span>
      </div>

      {/* KPI cards grid */}
      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <div
              key={card.key}
              className={`relative overflow-hidden rounded-2xl border border-white bg-gradient-to-br ${card.color} p-5 shadow-elevated bg-white`}
            >
              {/* Decorative corner */}
              <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/30 blur-2xl" />

              <div className="relative">
                {/* Icon */}
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                  {card.icon}
                </div>

                {/* Value */}
                <p className="font-display text-3xl font-bold text-navy-900">{card.value}</p>

                {/* Label */}
                <p className="mt-1 text-sm font-semibold text-slate-700">{card.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-elevated"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-xl transition group-hover:border-navy-100 group-hover:bg-navy-50">
                {link.icon}
              </span>
              <span className="font-medium text-slate-700 group-hover:text-navy-900">{link.label}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-auto text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-navy-400"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </section>

      {/* View public profile CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-navy-950 p-7 noise-layer">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(192,138,38,0.15),transparent)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-400">Public record</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-white">See how your record looks publicly</h3>
            <p className="mt-1 text-sm text-slate-400">Preview exactly what constituents see when they scan your QR code.</p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3 text-sm font-bold text-navy-950 shadow-lg shadow-gold-500/25 transition hover:from-gold-400 hover:to-gold-300"
          >
            View public page
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
