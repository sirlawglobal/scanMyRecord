import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/connection";
import { getQRAnalytics } from "@/services/qr.service";
import QRCodeModel from "@/models/QRCode";
import Politician from "@/models/Politician";
import Project from "@/models/Project";
import Programme from "@/models/Programme";
import FundraisingCampaign from "@/models/FundraisingCampaign";
import { DisableQrCodeButton, QrCodeCreateForm } from "./QrCodeActions";

const TARGET_TYPE_LABELS: Record<string, string> = {
  politician: "Politician",
  project: "Project",
  programme: "Programme",
  fundraising: "Fundraising",
};

export default async function AdminQrCodesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  await connectToDatabase();

  const [qrCodes, politicians, projects, programmes, fundraisingCampaigns] = await Promise.all([
    QRCodeModel.find({}).sort({ createdAt: -1 }).lean(),
    Politician.find({}).select("name").lean(),
    Project.find({}).select("title").lean(),
    Programme.find({}).select("title").lean(),
    FundraisingCampaign.find({}).select("title").lean(),
  ]);

  const politicianMap = new Map(politicians.map((doc) => [String(doc._id), doc.name as string]));
  const projectMap = new Map(projects.map((doc) => [String(doc._id), doc.title as string]));
  const programmeMap = new Map(programmes.map((doc) => [String(doc._id), doc.title as string]));
  const fundraisingMap = new Map(fundraisingCampaigns.map((doc) => [String(doc._id), doc.title as string]));

  function labelForTarget(targetType: string, targetId: unknown) {
    const id = String(targetId);

    if (targetType === "politician") return politicianMap.get(id) ?? "Unknown politician";
    if (targetType === "project") return projectMap.get(id) ?? "Unknown project";
    if (targetType === "programme") return programmeMap.get(id) ?? "Unknown programme";
    if (targetType === "fundraising") return fundraisingMap.get(id) ?? "Unknown campaign";

    return "Unknown target";
  }

  const rows = await Promise.all(
    qrCodes.map(async (qrCode) => {
      const { scanCount } = await getQRAnalytics(String(qrCode._id));

      return {
        id: String(qrCode._id),
        code: qrCode.code as string,
        targetType: qrCode.targetType as string,
        targetLabel: labelForTarget(qrCode.targetType as string, qrCode.targetId),
        status: qrCode.status as string,
        scanCount,
      };
    }),
  );

  const politicianOptions = politicians.map((doc) => ({ _id: String(doc._id), title: doc.name as string }));
  const projectOptions = projects.map((doc) => ({ _id: String(doc._id), title: doc.title as string }));
  const programmeOptions = programmes.map((doc) => ({ _id: String(doc._id), title: doc.title as string }));
  const fundraisingOptions = fundraisingCampaigns.map((doc) => ({ _id: String(doc._id), title: doc.title as string }));

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">QR codes</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">QR code management</h1>

          <QrCodeCreateForm
            politicians={politicianOptions}
            projects={projectOptions}
            programmes={programmeOptions}
            fundraisingCampaigns={fundraisingOptions}
          />
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Target</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Scans</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200">
                  <td className="px-5 py-4 font-mono font-semibold text-slate-900">{row.code}</td>
                  <td className="px-5 py-4">
                    {row.targetLabel}{" "}
                    <span className="text-xs uppercase tracking-wide text-slate-400">
                      ({TARGET_TYPE_LABELS[row.targetType] ?? row.targetType})
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        row.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {row.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">{row.scanCount}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/api/admin/qr-codes/${row.id}/download`}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                      >
                        Download PNG
                      </Link>
                      {row.status === "active" ? <DisableQrCodeButton id={row.id} /> : null}
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                    No QR codes yet. Create one above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
