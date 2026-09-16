import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Programme from "@/models/Programme";
import { EditProgrammeForm } from "./EditProgrammeForm";

export default async function AdminEditProgrammePage({
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
  const programme = await Programme.findById(id).lean();

  if (!programme) {
    notFound();
  }

  const serializedProgramme = {
    _id: String(programme._id),
    title: String(programme.title ?? ""),
    description: String(programme.description ?? ""),
    category: String(programme.category ?? "Youth Empowerment"),
    status: String(programme.status ?? "active"),
    registrationOpen: Boolean(programme.registrationOpen),
    capacity: programme.capacity ? Number(programme.capacity) : null,
    registrationDeadline: programme.registrationDeadline ? new Date(programme.registrationDeadline).toISOString() : null,
    images: Array.isArray(programme.images) ? programme.images.map((img: unknown) => String(img)) : [],
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-elevated">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Operations</p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">Edit Programme</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/programmes/${serializedProgramme._id}/registrations`}
              className="text-xs font-bold text-brand-600 hover:underline"
            >
              View Registrations →
            </Link>
            <Link
              href="/admin/programmes"
              className="text-xs font-bold text-slate-500 hover:text-navy-900"
            >
              ← Back
            </Link>
          </div>
        </div>

        <EditProgrammeForm programme={serializedProgramme} />
      </div>
    </main>
  );
}
