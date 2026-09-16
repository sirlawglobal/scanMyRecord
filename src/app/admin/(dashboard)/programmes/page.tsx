import Link from "next/link";
import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Programme from "@/models/Programme";
import Registration from "@/models/Registration";
import { DeleteActionButton } from "@/components/admin/DeleteActionButton";

type ProgrammeDoc = {
  _id: unknown;
  title: string;
  category?: string;
  status: "active" | "paused" | "closed";
  registrationOpen: boolean;
  registrationDeadline: Date | string | null;
};

function statusLabel(programme: ProgrammeDoc) {
  if (programme.status === "closed") {
    return "Closed";
  }

  if (programme.status === "paused" || !programme.registrationOpen) {
    return "Paused";
  }

  return "Open";
}

function statusClasses(label: string) {
  if (label === "Open") {
    return "bg-green-100 text-green-700";
  }

  if (label === "Paused") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-200 text-slate-700";
}

export default async function AdminProgrammesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  let programmes: ProgrammeDoc[] = [];
  const registrationCounts = new Map<string, number>();

  if (hasValidMongoUri()) {
    await connectToDatabase();
    programmes = (await Programme.find({}).sort({ createdAt: -1 }).lean()) as unknown as ProgrammeDoc[];

    for (const programme of programmes) {
      const count = await Registration.countDocuments({ programmeId: programme._id });
      registrationCounts.set(String(programme._id), count);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Operations</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">Programmes</h1>
          </div>
          <Link href="/admin/programmes/new" className="rounded-full bg-navy-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-navy-800">
            New programme
          </Link>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Programme</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Registrations</th>
                <th className="px-5 py-4">Deadline</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programmes.map((programme) => {
                const label = statusLabel(programme);
                const id = String(programme._id);

                return (
                  <tr key={id} className="border-t border-slate-200 hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <Link href={`/admin/programmes/${id}/edit`} className="hover:text-gold-600 hover:underline">
                        {programme.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {programme.category || "General"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClasses(label)}`}>{label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/programmes/${id}/registrations`}
                        className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
                      >
                        {registrationCounts.get(id) ?? 0}
                        <span className="text-[10px] text-slate-400">entries</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {programme.registrationDeadline
                        ? format(new Date(programme.registrationDeadline), "d MMM yyyy")
                        : "No deadline"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/programmes/${id}/edit`}
                          className="text-xs font-semibold text-navy-900 hover:text-gold-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteActionButton
                          endpoint={`/api/admin/programmes/${id}`}
                          itemName="programme"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {programmes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No programmes yet. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
