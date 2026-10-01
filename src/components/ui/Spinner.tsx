type SpinnerProps = {
  /** Diameter in px. */
  size?: number;
  /** Use on blue/dark backgrounds (e.g. inside a primary button). */
  light?: boolean;
  label?: string;
  className?: string;
};

export default function Spinner({ size = 20, light = false, label = "Loading", className = "" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`brand-spinner ${light ? "brand-spinner-light" : ""} ${className}`}
      style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 8)) }}
    />
  );
}

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 py-24">
      <Spinner size={44} label={label} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
