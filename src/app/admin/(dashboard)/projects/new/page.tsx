import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ProjectForm } from "./ProjectForm";

export default async function AdminCreateProjectPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-elevated">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Projects</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900">Create project</h1>

        <ProjectForm />
      </div>
    </main>
  );
}
