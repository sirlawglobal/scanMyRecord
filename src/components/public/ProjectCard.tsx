import Link from "next/link";

import type { PublicProject } from "@/lib/site/projects";

import { pickCover } from "@/lib/site/cover";

import ProjectCover from "./ProjectCover";
import ProjectStatusBadge from "./ProjectStatusBadge";

export default function ProjectCard({ project }: { project: PublicProject }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group card-hover flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-elevated"
    >
      {/* Cover: first image, or a muted looping video preview */}
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        <ProjectCover
          cover={pickCover(project.media, project.images)}
          title={project.title}
          fallbackLabel={project.category || "Project"}
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ProjectStatusBadge status={project.status} />
          {project.year ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              {project.year}
            </span>
          ) : null}
        </div>

        <h2 className="mt-4 font-display text-xl font-semibold text-navy-900 group-hover:text-navy-700">
          {project.title}
        </h2>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          {project.category}
        </p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
          {project.summary}
        </p>

        <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-gold-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          View details
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
