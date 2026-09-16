import Link from "next/link";
import { getPublicProfileConfig } from "@/lib/site/public-profile-server";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Scan My Record";

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
];

export default async function PublicFooter() {
  const profile = await getPublicProfileConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-navy-950 noise-layer">
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(192,138,38,0.12),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_auto]">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-navy-950">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold-400/70">{appName}</p>
                <p className="font-display text-lg font-semibold text-white leading-none">{profile.name}</p>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-7 text-slate-400">
              {profile.office} · {profile.constituency}
            </p>
            <p className="text-xs italic text-slate-500">
              "One scan. Four years of impact."
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Explore</p>
            <div className="mt-5 flex flex-col gap-3">
              {[
                { href: "/projects", label: "Projects" },
                { href: "/programmes", label: "Programmes" },
                { href: "/fundraising", label: "Fundraising" },
                { href: "/#timeline", label: "Timeline" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                  <span className="h-px w-3 bg-gold-400/40 transition-all duration-200 group-hover:w-5 group-hover:bg-gold-400" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Connect</p>
            <div className="mt-5 flex flex-col gap-3">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-3 text-sm text-slate-400 transition hover:text-white"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 transition group-hover:border-white/20 group-hover:bg-white/[0.1] group-hover:text-white">
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* QR scan CTA */}
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-gold-400/20 bg-gold-400/5">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-400">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" />
                <path d="M7 7h.01M18 7h.01M7 18h.01" strokeWidth="2.5" />
                <path d="M14 14h.01M18 14h3M14 18h3M18 18h.01" />
              </svg>
            </div>
            <p className="text-[11px] text-center text-slate-500 sm:text-right leading-5">
              Scan any QR code<br />to verify this record
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center gap-3 border-t border-white/[0.06] pt-8 text-[11px] text-slate-600 sm:flex-row sm:justify-between">
          <p>© {year} {appName}. Public accountability record.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400/60" />
            Verified by {appName} · Powered by civic transparency
          </p>
        </div>
      </div>
    </footer>
  );
}
