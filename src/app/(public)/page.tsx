import Link from "next/link";
import { getPublicProfileConfig } from "@/lib/site/public-profile-server";
import { getPublicProgrammeList, getPublicFundraisingCampaignList } from "@/lib/site/content";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Project from "@/models/Project";
import ProjectStatusBadge from "@/components/public/ProjectStatusBadge";
import Reveal from "@/components/public/Reveal";

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
    { label: "Projects delivered", value: completedCount },
    { label: "Ongoing projects", value: ongoingCount },
    { label: "Communities served", value: communityCount },
    { label: "Years of service", value: yearsOfService },
  ];

  const recordPreview = projects.slice(0, 6);
  const heroImage = projects.find((project) => project.images.length > 0)?.images[0];

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
      <section id="about" className="relative overflow-hidden bg-navy-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(192,138,46,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.06),transparent_40%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center space-y-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
              Public accountability record
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
                {profile.name}
              </h1>
              <p className="text-lg text-slate-300">{profile.office}</p>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{profile.constituency}</p>
            </div>

            <p className="max-w-xl text-lg leading-8 text-slate-300">{profile.tagline}</p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="#projects"
                className="rounded-full bg-gold-500 px-7 py-3.5 text-sm font-bold text-navy-950 shadow-elevated transition hover:bg-gold-400"
              >
                View the record
              </Link>
              <Link
                href="/programmes"
                className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Community programmes
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-gold-400/20 via-transparent to-transparent blur-2xl" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 shadow-elevated-lg">
              <img
                src={heroImage || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80"}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-elevated">
                <p className="font-display text-4xl font-semibold text-navy-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Impact</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">Four-year record</h2>
          </div>
          {projects.length > 0 && (
            <Link href="/projects" className="text-sm font-semibold text-navy-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-navy-700">
              View all projects →
            </Link>
          )}
        </Reveal>

        {recordPreview.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
            No project record has been published yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recordPreview.map((project, index) => (
              <Reveal key={project._id} delay={index * 0.05}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-elevated transition hover:-translate-y-1 hover:shadow-elevated-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    {project.images[0] ? (
                      <img
                        src={project.images[0]}
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-900 to-navy-700 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                        {project.category || "Project"}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <ProjectStatusBadge status={project.status} />
                    <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{project.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.category} · {project.year}
                    </p>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{project.summary}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section id="timeline" className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Timeline</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">Year-by-year progress</h2>
          </Reveal>

          {timelineByYear.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
              Timeline data will appear after your public record is configured.
            </div>
          ) : (
            <div className="relative mt-10 space-y-10 border-l border-slate-200 pl-8">
              {timelineByYear.map(([year, yearProjects], index) => (
                <Reveal key={year} delay={index * 0.05} className="relative">
                  <div className="absolute -left-[2.55rem] top-1 h-4 w-4 rounded-full border-4 border-white bg-gold-500 shadow-elevated" />
                  <p className="font-display text-2xl font-semibold text-navy-900">{year}</p>
                  <ul className="mt-4 space-y-3">
                    {yearProjects.map((project) => (
                      <li key={project._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="font-medium text-slate-800">{project.title}</span>
                        <ProjectStatusBadge status={project.status} />
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="programmes" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Community</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy-900 sm:text-4xl">Programmes</h2>
          </div>
          {programmes.length > 0 && (
            <Link href="/programmes" className="text-sm font-semibold text-navy-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-navy-700">
              View all programmes →
            </Link>
          )}
        </Reveal>

        {openProgrammes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
            No public programmes have been published yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {openProgrammes.map((programme, index) => (
              <Reveal key={programme._id} delay={index * 0.05}>
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
                    <span className="w-fit rounded-full bg-completed/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-completed">
                      Registration open
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{programme.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{programme.description}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      <section id="fundraising" className="bg-navy-950 py-16 text-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-400">Fundraising</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Support active community drives</h2>
          </Reveal>

          {activeCampaigns.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center text-slate-300">
              No active fundraising campaigns are available yet.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {activeCampaigns.map((campaign, index) => {
                const progress = campaign.targetAmount > 0 ? (campaign.raisedAmount / campaign.targetAmount) * 100 : 0;

                return (
                  <Reveal key={campaign._id} delay={index * 0.06}>
                    <Link
                      href={`/fundraising/${campaign.slug}`}
                      className="block rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:border-gold-400/40 hover:bg-white/[0.08]"
                    >
                      <h3 className="font-display text-xl font-semibold">{campaign.title}</h3>
                      <p className="mt-3 text-sm text-slate-300">
                        ₦{campaign.raisedAmount.toLocaleString()} raised of ₦{campaign.targetAmount.toLocaleString()}
                      </p>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.min(progress, 100)}%` }} />
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
