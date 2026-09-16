import Link from "next/link";
import { getPublicProfileConfig } from "@/lib/site/public-profile-server";
import MobileNavToggle from "./MobileNavToggle";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Scan My Record";

const NAV_LINKS = [
  { href: "/#about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/programmes", label: "Programmes" },
  { href: "/fundraising", label: "Fundraising" },
];

export default async function PublicNav() {
  const profile = await getPublicProfileConfig();

  return (
    <header className="sticky top-0 z-30 noise-layer overflow-visible">
      {/* Glass bar */}
      <div
        className="relative border-b border-white/[0.08] bg-navy-950/80 backdrop-blur-xl"
        style={{ backdropFilter: "blur(24px) saturate(180%)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Logo / Brand */}
          <Link href="/" className="group flex items-center gap-3">
            {/* Icon mark */}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg shadow-gold-500/30 transition group-hover:shadow-gold-500/50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-navy-950">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold-400/80">
                {appName}
              </span>
              <span className="font-display text-base font-semibold text-white">
                {profile.name}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.07] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/#fundraising"
              className="hidden rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2 text-sm font-bold text-navy-950 shadow-md shadow-gold-500/25 transition hover:from-gold-400 hover:to-gold-300 hover:shadow-gold-400/40 md:block"
            >
              Support the work
            </Link>
            <MobileNavToggle links={NAV_LINKS} />
          </div>
        </div>
      </div>
    </header>
  );
}
