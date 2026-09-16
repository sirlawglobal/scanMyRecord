import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Project from "@/models/Project";
import { EditProjectForm } from "./EditProjectForm";

export default async function AdminEditProjectPage({
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
  const project = await Project.findById(id).lean();

  if (!project || project.archived) {
    notFound();
  }

  const serializedProject = {
    _id: String(project._id),
    title: String(project.title ?? ""),
    summary: String(project.summary ?? ""),
    category: String(project.category ?? "Healthcare"),
    status: String(project.status ?? "proposed"),
    year: project.year ? Number(project.year) : undefined,
    location: String(project.location ?? ""),
    images: Array.isArray(project.images) ? project.images.map((img: unknown) => String(img)) : [],
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-elevated">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Portfolio</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">Edit Project</h1>
          </div>
          <Link
            href="/admin/projects"
            className="text-xs font-bold text-slate-500 hover:text-navy-900"
          >
            ← Back to projects
          </Link>
        </div>

        <EditProjectForm project={serializedProject} />
      </div>
    </main>
  );
}
