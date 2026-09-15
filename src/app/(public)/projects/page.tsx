import Link from "next/link";

import { getProjectStats, getPublicProjectList } from "@/lib/site/projects";
import ProjectCard from "@/components/public/ProjectCard";
import Reveal from "@/components/public/Reveal";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "ongoing", label: "Ongoing" },
  { value: "proposed", label: "Proposed" },
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
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Projects</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-navy-900 sm:text-5xl">
            Delivered and planned projects
          </h1>
        </Reveal>

        <Reveal delay={0.05} className="mb-8 flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((filter) => {
            const isActive = (status || "") === filter.value;
            return (
              <Link
                key={filter.label}
                href={`/projects${buildFilterHref(currentFilters, { status: filter.value || undefined })}`}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-navy-900 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </Reveal>

        {stats.categories.length > 0 ? (
          <Reveal delay={0.1} className="mb-8 flex flex-wrap items-center gap-2">
            <Link
              href={`/projects${buildFilterHref(currentFilters, { category: undefined })}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                !category ? "bg-gold-500 text-navy-950" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All categories
            </Link>
            {stats.categories.map((cat) => (
              <Link
                key={cat}
                href={`/projects${buildFilterHref(currentFilters, { category: cat })}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  category === cat ? "bg-gold-500 text-navy-950" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </Link>
            ))}
          </Reveal>
        ) : null}

        {stats.years.length > 0 ? (
          <Reveal delay={0.15} className="mb-10 flex flex-wrap items-center gap-2">
            <Link
              href={`/projects${buildFilterHref(currentFilters, { year: undefined })}`}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                !year ? "bg-navy-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All years
            </Link>
            {stats.years.map((y) => (
              <Link
                key={y}
                href={`/projects${buildFilterHref(currentFilters, { year: String(y) })}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  year === String(y) ? "bg-navy-900 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {y}
              </Link>
            ))}
          </Reveal>
        ) : null}

        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
            No public projects have been published yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal key={project._id || project.slug} delay={index * 0.05}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
