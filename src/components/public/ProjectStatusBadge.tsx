type ProjectStatus = "completed" | "ongoing" | "proposed";

const STATUS_CONFIG: Record<ProjectStatus, { label: string; icon: string; className: string }> = {
  completed: {
    label: "Completed",
    icon: "✓",
    className: "bg-completed/10 text-completed",
  },
  ongoing: {
    label: "Ongoing",
    icon: "◐",
    className: "bg-ongoing/10 text-ongoing",
  },
  proposed: {
    label: "Proposed",
    icon: "○",
    className: "bg-proposed/10 text-proposed",
  },
};

export default function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.proposed;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${config.className}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
