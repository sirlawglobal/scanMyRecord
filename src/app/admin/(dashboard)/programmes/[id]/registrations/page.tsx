import Link from "next/link";
import { format } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Programme from "@/models/Programme";
import Registration from "@/models/Registration";
import RegistrationStatusControl from "./RegistrationStatusControl";

type RegistrationDoc = {
  _id: unknown;
  fullName: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  reference: string;
  createdAt: Date | string;
};

export default async function AdminProgrammeRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { id } = await params;

  let programmeTitle = "Programme";
  let registrations: RegistrationDoc[] = [];

  if (hasValidMongoUri()) {
    await connectToDatabase();
    const programme = await Programme.findById(id).lean<{ title: string } | null>();

    if (programme) {
      programmeTitle = programme.title;
    }

    registrations = (await Registration.find({ programmeId: id })
      .sort({ createdAt: -1 })
      .lean()) as unknown as RegistrationDoc[];
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-elevated">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">
              <Link href="/admin/programmes" className="hover:underline">
                Programmes
              </Link>
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-slate-900">{programmeTitle} registrations</h1>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-elevated">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Full name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => (
                <tr key={String(registration._id)} className="border-t border-slate-200">
                  <td className="px-5 py-4 font-semibold text-slate-900">{registration.fullName}</td>
                  <td className="px-5 py-4">{registration.email}</td>
                  <td className="px-5 py-4">{registration.phone}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        registration.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : registration.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {registration.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">{registration.reference}</td>
                  <td className="px-5 py-4">{format(new Date(registration.createdAt), "d MMM yyyy")}</td>
                  <td className="px-5 py-4">
                    <RegistrationStatusControl id={String(registration._id)} status={registration.status} />
                  </td>
                </tr>
              ))}

              {registrations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No registrations yet.
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
