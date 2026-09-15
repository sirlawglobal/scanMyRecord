import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { canAccess } from "@/lib/auth/rbac";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import User from "@/models/User";
import { NewAdminForm } from "./NewAdminForm";

export default async function AdminAdministratorsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (!canAccess(session.role as "ADMIN" | "SUPER_ADMIN", ["SUPER_ADMIN"])) {
    redirect("/admin/dashboard");
  }

  const administrators = hasValidMongoUri()
    ? await (async () => {
        await connectToDatabase();
        return User.find({}).select("-passwordHash").sort({ createdAt: -1 }).lean();
      })()
    : [];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Team</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">Administrators</h1>

          <NewAdminForm />
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {administrators.map((admin) => (
                <tr key={String(admin._id)} className="border-t border-slate-200">
                  <td className="px-5 py-4 font-semibold text-slate-900">{admin.name as string}</td>
                  <td className="px-5 py-4">{admin.email as string}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                      {admin.role as string}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        admin.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {admin.createdAt ? new Date(admin.createdAt as string).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}

              {administrators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                    No administrators yet. Create one above.
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
