import Link from "next/link";
import { getPublicProgrammeList } from "@/lib/site/content";
import Reveal from "@/components/public/Reveal";

export default async function ProgrammesPage() {
  const programmes = await getPublicProgrammeList();

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Community</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-navy-900 sm:text-5xl">
            Community initiatives
          </h1>
        </Reveal>

        {programmes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
            No public programmes have been published yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {programmes.map((programme, index) => (
              <Reveal key={programme._id || programme.slug} delay={index * 0.05}>
                <Link
                  href={`/programmes/${programme.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-elevated transition hover:-translate-y-1 hover:shadow-elevated-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    {programme.images[0] ? (
                      <img
                        src={programme.images[0]}
                        alt={programme.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-900 to-navy-700 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                        Programme
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    {programme.registrationOpen ? (
                      <span className="w-fit rounded-full bg-completed/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-completed">
                        Registration open
                      </span>
                    ) : (
                      <span className="w-fit rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700">
                        {programme.status === "paused" ? "Paused" : "Closed"}
                      </span>
                    )}
                    <h2 className="mt-4 font-display text-lg font-semibold text-navy-900">{programme.title}</h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{programme.description}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
