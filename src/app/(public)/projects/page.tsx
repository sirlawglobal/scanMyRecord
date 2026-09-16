import Link from "next/link";

import { getProjectStats, getPublicProjectList } from "@/lib/site/projects";
import ProjectCard from "@/components/public/ProjectCard";
import Reveal from "@/components/public/Reveal";

const STATUS_FILTERS: { value: string; label: string; dot?: string }[] = [
  { value: "", label: "All" },
  { value: "completed", label: "Completed", dot: "bg-emerald-400" },
  { value: "ongoing", label: "Ongoing", dot: "bg-amber-400" },
  { value: "proposed", label: "Proposed", dot: "bg-indigo-400" },
];

function buildFilterHref(
  base: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
) {
  const merged = { ...base, ...overrides };
  const params = new URLSearchParams();

  Object.entries(merged).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; year?: string }>;
}) {
  const { status, category, year } = await searchParams;

  const [projects, stats] = await Promise.all([
    getPublicProjectList({
      status: status || undefined,
      category: category || undefined,
      year: year ? Number(year) : undefined,
    }),
    getProjectStats(),
  ]);

  const currentFilters = { status, category, year };

  return (
    <main>
      {/* Page header — dark hero strip */}
      <section className="relative overflow-hidden bg-navy-950 noise-layer py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_5%_50%,rgba(192,138,38,0.14),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400">Projects</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
              Delivered and planned projects
            </h1>
            <p className="mt-3 max-w-xl text-base text-slate-400">
              A transparent, verifiable record of all constituency projects — past, present, and future.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Status filters */}
          <Reveal className="mb-5 flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((filter) => {
              const isActive = (status || "") === filter.value;
              return (
                <Link
                  key={filter.label}
                  href={`/projects${buildFilterHref(currentFilters, { status: filter.value || undefined })}`}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-navy-900 text-white shadow-md shadow-navy-900/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-navy-200 hover:bg-navy-900/5 hover:text-navy-900"
                  }`}
                >
                  {filter.dot && (
                    <span className={`h-1.5 w-1.5 rounded-full ${filter.dot}`} />
                  )}
                  {filter.label}
                </Link>
              );
            })}
          </Reveal>

          {/* Category filters */}
          {stats.categories.length > 0 ? (
            <Reveal delay={0.06} className="mb-5 flex flex-wrap items-center gap-2">
              <Link
                href={`/projects${buildFilterHref(currentFilters, { category: undefined })}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  !category
                    ? "bg-gold-500 text-navy-950 shadow-sm shadow-gold-400/30"
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                All categories
              </Link>
              {stats.categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/projects${buildFilterHref(currentFilters, { category: cat })}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    category === cat
                      ? "bg-gold-500 text-navy-950 shadow-sm shadow-gold-400/30"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </Reveal>
          ) : null}

          {/* Year filters */}
          {stats.years.length > 0 ? (
            <Reveal delay={0.1} className="mb-10 flex flex-wrap items-center gap-2">
              <Link
                href={`/projects${buildFilterHref(currentFilters, { year: undefined })}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  !year
                    ? "bg-navy-900 text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                All years
              </Link>
              {stats.years.map((y) => (
                <Link
                  key={y}
                  href={`/projects${buildFilterHref(currentFilters, { year: String(y) })}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    year === String(y)
                      ? "bg-navy-900 text-white"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {y}
                </Link>
              ))}
            </Reveal>
          ) : null}

          {/* Grid */}
          {projects.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">🔍</div>
              <p className="text-slate-500">No projects match the selected filters.</p>
              <Link
                href="/projects"
                className="text-sm font-semibold text-navy-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-navy-700"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project, index) => (
                <Reveal key={project._id || project.slug} delay={index * 0.05}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
