import Link from "next/link";

import type { PublicProject } from "@/lib/site/projects";

import ProjectStatusBadge from "./ProjectStatusBadge";

export default function ProjectCard({ project }: { project: PublicProject }) {
  const coverImage = project.images?.[0];

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-elevated transition hover:-translate-y-1 hover:shadow-elevated-lg"
    >
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <ProjectStatusBadge status={project.status} />
          {project.year ? <span className="text-xs font-semibold text-slate-500">{project.year}</span> : null}
        </div>

        <h2 className="font-display text-xl font-semibold text-navy-900">{project.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{project.category}</p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{project.summary}</p>
      </div>
    </Link>
  );
}
