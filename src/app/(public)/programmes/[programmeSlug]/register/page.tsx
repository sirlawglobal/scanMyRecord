import { getPublicProgrammeBySlug } from "@/lib/site/content";
import RegisterForm from "./RegisterForm";

export default async function ProgrammeRegisterPage({
  params,
}: {
  params: Promise<{ programmeSlug: string }>;
}) {
  const { programmeSlug } = await params;
  const programme = await getPublicProgrammeBySlug(programmeSlug);

  return (
    <main>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-elevated">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Registration</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-navy-900">
            {programme?.title ?? "Programme not found"}
          </h1>
          {programme?.description && <p className="mt-3 text-slate-600">{programme.description}</p>}

          <RegisterForm programmeSlug={programmeSlug} />
        </div>
      </section>
    </main>
  );
}
