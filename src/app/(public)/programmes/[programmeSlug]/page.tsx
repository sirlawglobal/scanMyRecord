import Link from "next/link";
import { getPublicProgrammeBySlug } from "@/lib/site/content";
import Reveal from "@/components/public/Reveal";

const defaultProgramme = {
  title: "Programme not found",
  status: "inactive",
  description: "This programme is not published yet.",
  eligibility: ["Programme data is not available."],
  baseFields: ["Name", "Phone", "Email"],
};

export default async function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ programmeSlug: string }>;
}) {
  const { programmeSlug } = await params;
  const programme = await getPublicProgrammeBySlug(programmeSlug);

  const activeProgramme = programme
    ? {
        title: programme.title,
        status: programme.status,
        description: programme.description || "No description added yet.",
        eligibility: ["Resident of the constituency", "Eligible household or applicant", "Programme-specific requirements apply"],
        baseFields: ["Full Name", "Phone", "Email", "Address", "State", "LGA"],
      }
    : defaultProgramme;

  const heroImage = programme?.images[0];

  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-elevated">
            {heroImage ? (
              <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                <img src={heroImage} alt={activeProgramme.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              programme && (
                <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-navy-900 to-navy-700 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                  Programme
                </div>
              )
            )}

            <div className="p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Programme</p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-navy-900 sm:text-5xl">
                {activeProgramme.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{activeProgramme.description}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                {programme ? (
                  programme.registrationOpen ? (
                    <span className="w-fit rounded-full bg-completed/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-completed">
                      Registration open
                    </span>
                  ) : (
                    <span className="w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                      {activeProgramme.status === "paused" ? "Paused" : "Closed"}
                    </span>
                  )
                ) : (
                  <span className="w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                    {activeProgramme.status}
                  </span>
                )}
              </div>

              <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <h2 className="font-display text-xl font-semibold text-navy-900">Eligibility</h2>
                  <ul className="mt-4 space-y-3 text-slate-600">
                    {activeProgramme.eligibility.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-slate-50 p-6">
                  <h2 className="font-display text-xl font-semibold text-navy-900">Registration fields</h2>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    {activeProgramme.baseFields.map((field) => (
                      <li key={field}>• {field}</li>
                    ))}
                  </ul>

                  {programme ? (
                    programme.registrationOpen ? (
                      <Link
                        href={`/programmes/${programme.slug}/register`}
                        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800"
                      >
                        Register now
                      </Link>
                    ) : (
                      <span className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-400">
                        Registration closed
                      </span>
                    )
                  ) : (
                    <Link
                      href="/programmes"
                      className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      Back to programmes
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
