import Link from "next/link";
import { getPublicProgrammeList } from "@/lib/site/content";
import Reveal from "@/components/public/Reveal";

export default async function ProgrammesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const allProgrammes = await getPublicProgrammeList();

  const categories = Array.from(
    new Set(allProgrammes.map((p) => p.category || "General").filter(Boolean)),
  ).sort();

  const filteredProgrammes = category
    ? allProgrammes.filter(
        (p) => (p.category || "General").toLowerCase() === category.toLowerCase(),
      )
    : allProgrammes;

  return (
    <main>
      {/* Page header — cinematic dark hero strip */}
      <section className="relative overflow-hidden bg-navy-950 noise-layer py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_5%_50%,rgba(192,138,38,0.14),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400">Community Empowerment</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
              Community initiatives & programmes
            </h1>
            <p className="mt-3 max-w-xl text-base text-slate-400">
              Grassroots programs, skills empowerment, education grants, and citizen welfare initiatives.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Listing & Filters */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Category:</span>
            <Link
              href="/programmes"
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                !category
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Initiatives ({allProgrammes.length})
            </Link>
            {categories.map((cat) => {
              const isSelected = category?.toLowerCase() === cat.toLowerCase();
              const count = allProgrammes.filter(
                (p) => (p.category || "General").toLowerCase() === cat.toLowerCase(),
              ).length;

              return (
                <Link
                  key={cat}
                  href={`/programmes?category=${encodeURIComponent(cat)}`}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-gold-500 text-navy-950 shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat} ({count})
                </Link>
              );
            })}
          </div>
        )}

        {filteredProgrammes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
            <p className="text-base font-medium">No programmes found in this category.</p>
            {category && (
              <Link href="/programmes" className="mt-4 inline-block text-xs font-bold text-gold-600 hover:underline">
                Clear filter and view all
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProgrammes.map((programme, index) => (
              <Reveal key={programme._id || programme.slug} delay={index * 0.05}>
                <Link
                  href={`/programmes/${programme.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-elevated transition hover:-translate-y-1 hover:shadow-elevated-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {programme.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={programme.images[0]}
                        alt={programme.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-900 to-navy-700 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                        {programme.category || "Programme"}
                      </div>
                    )}

                    {/* Category tag in image overlay */}
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-navy-950/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-400 backdrop-blur-md">
                        {programme.category || "General"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between">
                      {programme.registrationOpen ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Registration open
                        </span>
                      ) : (
                        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
                          {programme.status === "paused" ? "Paused" : "Closed"}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 font-display text-lg font-semibold text-navy-900 group-hover:text-gold-600 transition-colors">
                      {programme.title}
                    </h2>
                    <p className="mt-2.5 line-clamp-3 text-sm leading-6 text-slate-600">
                      {programme.description}
                    </p>

                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-100 text-xs font-semibold text-navy-900">
                      <span>View details & register</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
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
