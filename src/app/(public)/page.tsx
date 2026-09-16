import Link from "next/link";
import { getPublicProfileConfig } from "@/lib/site/public-profile-server";
import { getPublicProgrammeList, getPublicFundraisingCampaignList } from "@/lib/site/content";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Project from "@/models/Project";
import ProjectStatusBadge from "@/components/public/ProjectStatusBadge";
import Reveal from "@/components/public/Reveal";
import Counter from "@/components/public/Counter";

type ProjectSummary = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  status: "completed" | "ongoing" | "proposed";
  category: string;
  year: number;
  location: string;
  images: string[];
};

async function getLandingProjects(): Promise<ProjectSummary[]> {
  if (!hasValidMongoUri()) {
    return [];
  }

  try {
    await connectToDatabase();
    const projects = await Project.find({ archived: { $ne: true } })
      .sort({ year: -1, createdAt: -1 })
      .lean();

    return projects.map((project) => ({
      _id: String(project._id),
      title: String(project.title ?? "Untitled project"),
      slug: String(project.slug ?? ""),
      summary: String(project.summary ?? ""),
      status: (project.status as ProjectSummary["status"]) ?? "proposed",
      category: String(project.category ?? ""),
      year: Number(project.year ?? 0),
      location: String(project.location ?? ""),
      images: Array.isArray(project.images) ? project.images.map((image: unknown) => String(image)) : [],
    }));
  } catch {
    return [];
  }
}

function estimateYearsOfService(servicePeriod: string, projectYears: number[]) {
  const years = servicePeriod.match(/\d{4}/g)?.map(Number) ?? [];

  if (years.length >= 2) {
    return Math.max(0, years[1] - years[0]);
  }

  if (projectYears.length >= 2) {
    return Math.max(...projectYears) - Math.min(...projectYears);
  }

  return 0;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [profile, projects, programmes, campaigns] = await Promise.all([
    getPublicProfileConfig(),
    getLandingProjects(),
    getPublicProgrammeList(),
    getPublicFundraisingCampaignList(),
  ]);

  const completedCount = projects.filter((project) => project.status === "completed").length;
  const ongoingCount = projects.filter((project) => project.status === "ongoing").length;
  const communityCount = new Set(projects.map((project) => project.location).filter(Boolean)).size;
  const yearsOfService = estimateYearsOfService(
    profile.tagline,
    projects.map((project) => project.year).filter(Boolean),
  );

  const stats = [
    { label: "Projects delivered", value: completedCount, icon: "🏗️", detail: "Completed works" },
    { label: "Ongoing projects", value: ongoingCount, icon: "⚙️", detail: "Active in field" },
    { label: "Communities served", value: communityCount, icon: "🏘️", detail: "Wards reached" },
    { label: "Years of service", value: yearsOfService, icon: "📅", detail: "Documented record" },
  ];

  const recordPreview = projects.slice(0, 6);
  const heroImage =
    profile.profileImage ||
    projects.find((project) => project.images && project.images.length > 0)?.images[0] ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80";

  const timelineByYear = Object.entries(
    projects.reduce<Record<number, ProjectSummary[]>>((acc, project) => {
      (acc[project.year] ||= []).push(project);
      return acc;
    }, {}),
  ).sort(([yearA], [yearB]) => Number(yearB) - Number(yearA));

  const openProgrammes = programmes.filter((programme) => programme.registrationOpen).slice(0, 3);
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active").slice(0, 2);

  return (
    <main>
      {/* ──────────────────────────────────────────────────────────────
          HERO — Cinematic Full-Bleed Dark Section (Mobile-First + Desktop)
      ────────────────────────────────────────────────────────────── */}
      <section id="about" className="relative overflow-hidden bg-navy-950 noise-layer">
        {/* Layered ambient light cones */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(192,138,38,0.22),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_40%,rgba(58,82,160,0.2),transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-28">
          {/* ══════════════════════════════════════════════════════════
              MOBILE HERO VIEW (< lg) — High-Impact Mobile Showcase
          ══════════════════════════════════════════════════════════ */}
          <div className="flex flex-col items-center text-center lg:hidden space-y-6">
            {/* Top Eyebrow Badge */}
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-gold-300 backdrop-blur-md shadow-lg shadow-gold-500/10">
                <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
                <span>Citizen Accountability Record</span>
              </div>
            </Reveal>

            {/* Prominent Official Portrait Avatar with Luxury Gold Halo */}
            <Reveal delay={0.05}>
              <div className="relative mx-auto mt-2">
                {/* Glow ring aura */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-gold-400/30 via-amber-500/20 to-blue-600/30 blur-2xl" />

                {/* Portrait container */}
                <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-full p-1.5 bg-gradient-to-b from-gold-400 via-amber-600 to-navy-800 shadow-2xl shadow-black/80">
                  <div className="h-full w-full overflow-hidden rounded-full border-2 border-navy-950 bg-navy-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroImage}
                      alt={profile.name}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>

                {/* Floating Verified Badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-400/40 bg-navy-950/95 px-3.5 py-1 text-[11px] font-bold text-emerald-400 shadow-xl backdrop-blur-md flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Verified Public Record</span>
                </div>
              </div>
            </Reveal>

            {/* Name + Elected Office */}
            <Reveal delay={0.1}>
              <div className="space-y-2 pt-2">
                <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
                  {profile.name}
                </h1>
                <p className="text-base sm:text-lg font-semibold text-gold-300">
                  {profile.office}
                </p>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 px-3.5 py-1 text-xs text-slate-300 font-medium">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gold-400">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{profile.constituency}</span>
                </div>
              </div>
            </Reveal>

            {/* Mission Statement / Tagline */}
            {profile.tagline && (
              <Reveal delay={0.14}>
                <div className="mx-auto max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-xs sm:text-sm text-slate-300 leading-relaxed backdrop-blur-sm shadow-inner">
                  &ldquo;{profile.tagline}&rdquo;
                </div>
              </Reveal>
            )}

            {/* Mobile CTAs (Full Width Stack) */}
            <Reveal delay={0.18} className="w-full max-w-sm pt-1">
              <div className="flex flex-col gap-3">
                <Link
                  href="#projects"
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-500 via-gold-400 to-amber-400 px-6 py-3.5 text-sm font-bold text-navy-950 shadow-xl shadow-gold-500/25 transition active:scale-95"
                >
                  <span>View Four-Year Record</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/programmes"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.15] active:scale-95"
                >
                  <span>Community Programmes</span>
                </Link>
              </div>
            </Reveal>

            {/* Mobile 2x2 Impact Counter Grid */}
            <Reveal delay={0.22} className="w-full pt-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-left">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 backdrop-blur-md shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gold-400/80">
                        {stat.detail}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Counter
                        value={stat.value}
                        className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight"
                      />
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ══════════════════════════════════════════════════════════
              DESKTOP HERO VIEW (lg:grid) — Executive Split Layout
          ══════════════════════════════════════════════════════════ */}
          <div className="hidden lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 items-center">
            {/* ── Left column ── */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Eyebrow badge */}
              <Reveal>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-gold-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-gold-400" />
                  Public accountability record
                </div>
              </Reveal>

              {/* Name + position */}
              <Reveal delay={0.05}>
                <div className="space-y-3">
                  <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-white xl:text-7xl">
                    {profile.name}
                  </h1>
                  <p className="text-xl font-semibold text-gold-300">{profile.office}</p>
                  <p className="flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-slate-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gold-400">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {profile.constituency}
                  </p>
                </div>
              </Reveal>

              {/* Tagline */}
              <Reveal delay={0.1}>
                <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                  {profile.tagline}
                </p>
              </Reveal>

              {/* CTAs */}
              <Reveal delay={0.14}>
                <div className="flex flex-wrap gap-4 pt-1">
                  <Link
                    href="#projects"
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-7 py-3.5 text-sm font-bold text-navy-950 shadow-lg shadow-gold-500/30 transition-all hover:from-gold-400 hover:to-gold-300 hover:shadow-gold-400/40 hover:-translate-y-0.5"
                  >
                    View the record
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href="/programmes"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/[0.1] hover:-translate-y-0.5"
                  >
                    Community programmes
                  </Link>
                </div>
              </Reveal>

              {/* Stat counters */}
              <Reveal delay={0.18}>
                <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex flex-col gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4 backdrop-blur-sm"
                    >
                      <Counter
                        value={stat.value}
                        className="font-display text-3xl font-semibold text-white sm:text-4xl"
                      />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* ── Right column — photo ── */}
            <Reveal delay={0.08} className="relative flex items-center justify-end">
              {/* Decorative glow ring */}
              <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-gold-400/15 via-transparent to-navy-700/30 blur-3xl" />

              <div className="relative w-full max-w-md">
                {/* Gold corner accents */}
                <div className="absolute -right-3 -top-3 h-20 w-20 rounded-tr-[2rem] border-r-2 border-t-2 border-gold-400/50" />
                <div className="absolute -bottom-3 -left-3 h-20 w-20 rounded-bl-[2rem] border-b-2 border-l-2 border-gold-400/30" />

                <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/[0.1] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7)] bg-navy-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImage}
                    alt={profile.name}
                    className="h-full w-full object-cover object-top"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/15 to-transparent" />

                  {/* Floating info chip */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-navy-950/80 p-3.5 backdrop-blur-md">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400/20 text-gold-300">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">{profile.name}</p>
                      <p className="truncate text-[10px] text-slate-400">{profile.office}</p>
                    </div>
                    <div className="ml-auto shrink-0">
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          FOUR-YEAR RECORD
      ────────────────────────────────────────────────────────────── */}
      <section id="projects" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Impact</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
                Four-year record
              </h2>
              <p className="mt-2 text-sm text-slate-500">Projects delivered, in progress, and planned</p>
            </div>
            {projects.length > 0 && (
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 rounded-full border border-navy-900/20 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition hover:border-navy-900/40 hover:shadow-md"
              >
                View all projects
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </Reveal>

          {recordPreview.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">📋</div>
              <p className="text-slate-500">No project record has been published yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {recordPreview.map((project, index) => (
                <Reveal key={project._id} delay={index * 0.05}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group card-hover flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-elevated"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                      {project.images[0] ? (
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                          {project.category || "Project"}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <ProjectStatusBadge status={project.status} />
                      <h3 className="mt-4 font-display text-lg font-semibold text-navy-900 group-hover:text-navy-700">
                        {project.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <span>{project.category}</span>
                        <span className="text-slate-300">·</span>
                        <span>{project.year}</span>
                      </p>
                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
                        {project.summary}
                      </p>
                      <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-gold-600 transition group-hover:text-gold-500">
                        View details
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          TIMELINE
      ────────────────────────────────────────────────────────────── */}
      <section id="timeline" className="relative overflow-hidden bg-white py-20">
        {/* Decorative side element */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-gold-400/20 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Timeline</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
              Year-by-year progress
            </h2>
          </Reveal>

          {timelineByYear.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">📅</div>
              <p className="text-slate-500">Timeline data will appear after your public record is configured.</p>
            </div>
          ) : (
            <div className="relative mt-12 pl-6 sm:pl-10">
              {/* Vertical line */}
              <div className="absolute left-0 top-3 bottom-3 w-px bg-gradient-to-b from-gold-400/60 via-gold-400/20 to-transparent" />

              <div className="space-y-10">
                {timelineByYear.map(([year, yearProjects], index) => (
                  <Reveal key={year} delay={index * 0.06} className="relative">
                    {/* Year dot */}
                    <div className="absolute -left-6 top-1 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-gold-500 shadow-[0_0_0_4px_rgba(192,138,38,0.2)] sm:-left-10" />

                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
                      <p className="font-display text-2xl font-semibold text-navy-900 sm:text-3xl">{year}</p>
                      <ul className="mt-4 space-y-2.5">
                        {yearProjects.map((project) => (
                          <li
                            key={project._id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white bg-white px-4 py-3 shadow-sm"
                          >
                            <span className="font-medium text-slate-800">{project.title}</span>
                            <ProjectStatusBadge status={project.status} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          PROGRAMMES
      ────────────────────────────────────────────────────────────── */}
      <section id="programmes" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Community</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">
                Programmes
              </h2>
              <p className="mt-2 text-sm text-slate-500">Open for community participation</p>
            </div>
            {programmes.length > 0 && (
              <Link
                href="/programmes"
                className="group inline-flex items-center gap-2 rounded-full border border-navy-900/20 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition hover:border-navy-900/40 hover:shadow-md"
              >
                View all programmes
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </Reveal>

          {openProgrammes.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">🏫</div>
              <p className="text-slate-500">No public programmes have been published yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {openProgrammes.map((programme, index) => (
                <Reveal key={programme._id} delay={index * 0.05}>
                  <Link
                    href={`/programmes/${programme.slug}`}
                    className="group card-hover flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-elevated"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                      {programme.images[0] ? (
                        <img
                          src={programme.images[0]}
                          alt={programme.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                          Programme
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        Registration open
                      </span>
                      <h3 className="mt-4 font-display text-lg font-semibold text-navy-900 group-hover:text-navy-700">
                        {programme.title}
                      </h3>
                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
                        {programme.description}
                      </p>
                      <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-gold-600 transition group-hover:text-gold-500">
                        Register now
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
          FUNDRAISING
      ────────────────────────────────────────────────────────────── */}
      <section id="fundraising" className="relative overflow-hidden bg-navy-950 py-20 noise-layer">
        {/* Ambients */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(58,82,160,0.25),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_70%,rgba(192,138,38,0.1),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-400">Fundraising</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
              Support active community drives
            </h2>
            <p className="mt-2 text-sm text-slate-400">Your contribution powers real change on the ground.</p>
          </Reveal>

          {activeCampaigns.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-2xl">💰</div>
              <p className="text-slate-400">No active fundraising campaigns are available yet.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {activeCampaigns.map((campaign, index) => {
                const progress =
                  campaign.targetAmount > 0
                    ? (campaign.raisedAmount / campaign.targetAmount) * 100
                    : 0;

                return (
                  <Reveal key={campaign._id} delay={index * 0.06}>
                    <Link
                      href={`/fundraising/${campaign.slug}`}
                      className="group block rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7 transition hover:border-gold-400/30 hover:bg-white/[0.07]"
                    >
                      {/* Title + active chip */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="font-display text-xl font-semibold text-white">{campaign.title}</h3>
                        <span className="flex items-center gap-1.5 rounded-full bg-gold-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-400">
                          <span className="h-1 w-1 animate-pulse rounded-full bg-gold-400" />
                          Active
                        </span>
                      </div>

                      {/* Amount */}
                      <p className="mt-4 text-sm text-slate-400">
                        <span className="text-lg font-bold text-white">
                          ₦{campaign.raisedAmount.toLocaleString()}
                        </span>
                        {" "}raised of{" "}
                        <span className="text-slate-300">₦{campaign.targetAmount.toLocaleString()}</span>
                      </p>

                      {/* Progress bar */}
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 shadow-[0_0_8px_rgba(192,138,38,0.5)] transition-all duration-1000"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{Math.round(progress)}% funded</span>
                        <span className="flex items-center gap-1 text-gold-400 opacity-0 transition group-hover:opacity-100">
                          Contribute now
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
