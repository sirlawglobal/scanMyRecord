import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import QRScan from "@/models/QRScan";
import Registration from "@/models/Registration";
import { AnalyticsCharts, type AnalyticsPoint } from "@/components/admin/AnalyticsCharts";

const DAY_MS = 24 * 60 * 60 * 1000;

async function getSeries(): Promise<AnalyticsPoint[]> {
  if (!hasValidMongoUri()) {
    return [];
  }

  await connectToDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: { start: Date; end: Date; label: string }[] = [];

  for (let i = 13; i >= 0; i -= 1) {
    const start = new Date(today.getTime() - i * DAY_MS);
    const end = new Date(start.getTime() + DAY_MS);
    const label = start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    days.push({ start, end, label });
  }

  const series = await Promise.all(
    days.map(async ({ start, end, label }) => {
      const [scans, registrations] = await Promise.all([
        QRScan.countDocuments({ createdAt: { $gte: start, $lt: end } }),
        Registration.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      ]);

      return { date: label, scans, registrations };
    }),
  );

  return series;
}

export default async function AdminAnalyticsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const series = await getSeries();

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Analytics</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">Impact overview</h1>
        </header>

        <AnalyticsCharts data={series} />
      </div>
    </main>
  );
}
