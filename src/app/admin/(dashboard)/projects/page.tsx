import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Project from "@/models/Project";
import { DeleteActionButton } from "@/components/admin/DeleteActionButton";

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  ongoing: "Ongoing",
  proposed: "Proposed",
};

const STATUS_CLASSES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  ongoing: "bg-amber-100 text-amber-700",
  proposed: "bg-indigo-100 text-indigo-700",
};

export default async function AdminProjectsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const projects = hasValidMongoUri()
    ? await (async () => {
        await connectToDatabase();
        return Project.find({ archived: { $ne: true } }).sort({ createdAt: -1 }).lean();
      })()
    : [];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Portfolio</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">Projects</h1>
          </div>
          <Link href="/admin/projects/new" className="rounded-full bg-navy-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-navy-800">
            New project
          </Link>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Project</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const id = String(project._id);
                return (
                  <tr key={id} className="border-t border-slate-200 hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <Link href={`/admin/projects/${id}`} className="hover:text-gold-600 hover:underline">
                        {project.title as string}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {project.category as string}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          STATUS_CLASSES[project.status as string] ?? "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {STATUS_LABELS[project.status as string] ?? (project.status as string)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/projects/${id}`}
                          className="text-xs font-semibold text-navy-900 hover:text-gold-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <DeleteActionButton
                          endpoint={`/api/admin/projects/${id}`}
                          itemName="project"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}

              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">
                    No projects yet. Create one above.
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
