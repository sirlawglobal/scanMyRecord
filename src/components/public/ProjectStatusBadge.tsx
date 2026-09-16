type ProjectStatus = "completed" | "ongoing" | "proposed";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; icon: string; className: string; dotClass: string }
> = {
  completed: {
    label: "Completed",
    icon: "✓",
    className:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.12)]",
    dotClass: "bg-emerald-400",
  },
  ongoing: {
    label: "Ongoing",
    icon: "◐",
    className:
      "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.12)]",
    dotClass: "bg-amber-400 animate-pulse",
  },
  proposed: {
    label: "Proposed",
    icon: "○",
    className:
      "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.12)]",
    dotClass: "bg-indigo-400",
  },
};

export default function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.proposed;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${config.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
}
