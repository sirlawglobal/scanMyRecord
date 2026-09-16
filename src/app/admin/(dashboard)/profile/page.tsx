import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Politician from "@/models/Politician";
import { ProfileForm } from "./ProfileForm";

export default async function AdminProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const politician = hasValidMongoUri()
    ? await (async () => {
        await connectToDatabase();
        return Politician.findOne({}).sort({ createdAt: -1 }).lean();
      })()
    : null;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-elevated">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Profile</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-slate-900">Politician profile</h1>

        <ProfileForm
          name={(politician?.name as string) ?? ""}
          office={(politician?.office as string) ?? ""}
          bio={(politician?.bio as string) ?? ""}
          constituency={(politician?.constituency as string) ?? ""}
          servicePeriod={(politician?.servicePeriod as string) ?? "2023 - 2027"}
          profileImage={(politician?.profileImage as string) ?? ""}
          socialLinks={
            politician?.socialLinks
              ? Object.fromEntries(
                  politician.socialLinks instanceof Map
                    ? politician.socialLinks
                    : Object.entries(politician.socialLinks),
                )
              : {}
          }
        />
      </div>
    </main>
  );
}
