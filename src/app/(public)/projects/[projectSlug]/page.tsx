import Link from "next/link";
import type { Metadata } from "next";

import { getPublicProjectBySlug, type ProjectMediaItem } from "@/lib/site/projects";
import ProjectStatusBadge from "@/components/public/ProjectStatusBadge";
import ShareButtons from "@/components/public/ShareButtons";
import Reveal from "@/components/public/Reveal";
import BeforeAfterSlider from "@/components/public/BeforeAfterSlider";

function MediaTile({ item, title }: { item: ProjectMediaItem; title: string }) {
  if (item.type === "video") {
    return (
      <video
        src={item.url}
        controls
        playsInline
        className="aspect-[4/3] w-full rounded-2xl bg-navy-950 object-cover shadow-elevated"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.url} alt={title} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-elevated" />
  );
}

type ProjectPageParams = { projectSlug: string };

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") || "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<ProjectPageParams>;
}): Promise<Metadata> {
  const { projectSlug } = await params;
  const project = await getPublicProjectBySlug(projectSlug);

  if (!project) {
    return {
      title: "Project not found — Scan My Record",
      description: "This project could not be found.",
    };
  }

  const title = `${project.title} — Scan My Record`;
  const description = (project.summary || "View this project's details.").slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: project.images.length > 0 ? [{ url: project.images[0] }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<ProjectPageParams>;
}) {
  const { projectSlug } = await params;
  const project = await getPublicProjectBySlug(projectSlug);

  if (!project) {
    return (
      <main>
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-elevated">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Project</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-navy-900">Project not found</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              This project is not published yet.
            </p>
            <Link
              href="/projects"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800"
            >
              Back to projects
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const appUrl = getAppUrl();
  const pageUrl = `${appUrl}/projects/${project.slug}`;

  const beforeItem = project.media.find((item) => item.type === "image" && item.stage === "before");
  const afterItem = project.media.find((item) => item.type === "image" && item.stage === "after");
  const hasComparison = Boolean(beforeItem && afterItem);
  const usedUrls = new Set([beforeItem?.url, afterItem?.url].filter(Boolean));
  const remainingMedia = project.media.filter((item) => !usedUrls.has(item.url));

  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <Link
            href="/projects"
            className="text-sm font-semibold text-slate-500 transition hover:text-navy-900"
          >
            ← Back to projects
          </Link>
        </Reveal>

        <Reveal delay={0.05} className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Project</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-navy-900 sm:text-5xl">{project.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <ProjectStatusBadge status={project.status} />
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {project.category ? <span>{project.category}</span> : null}
              {project.category && project.year ? <span aria-hidden="true">·</span> : null}
              {project.year ? <span className="font-mono">{project.year}</span> : null}
              {(project.category || project.year) && project.location ? <span aria-hidden="true">·</span> : null}
              {project.location ? <span>{project.location}</span> : null}
            </div>
          </div>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {project.summary || "No description added yet."}
          </p>
        </Reveal>

        {hasComparison ? (
          <Reveal delay={0.1} className="mt-10">
            <h2 className="mb-3 font-display text-lg font-semibold text-navy-900">Drag to compare</h2>
            <BeforeAfterSlider beforeUrl={beforeItem!.url} afterUrl={afterItem!.url} title={project.title} />
          </Reveal>
        ) : null}

        <Reveal delay={hasComparison ? 0.15 : 0.1} className="mt-10">
          {remainingMedia.length > 1 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {remainingMedia.map((item, index) => (
                <MediaTile key={`${item.url}-${index}`} item={item} title={project.title} />
              ))}
            </div>
          ) : remainingMedia.length === 1 ? (
            <div className="mx-auto max-w-2xl">
              <MediaTile item={remainingMedia[0]} title={project.title} />
            </div>
          ) : !hasComparison ? (
            <div className="flex aspect-[16/9] items-center justify-center rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              {project.category || "No images available"}
            </div>
          ) : null}
        </Reveal>

        <Reveal delay={0.2} className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="font-display text-xl font-semibold text-navy-900">Share this project</h2>
          <div className="mt-4">
            <ShareButtons url={pageUrl} title={project.title} />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
