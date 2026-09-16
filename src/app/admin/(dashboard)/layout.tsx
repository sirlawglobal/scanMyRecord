import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/admin/profile",
    label: "Profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/admin/projects",
    label: "Projects",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    href: "/admin/programmes",
    label: "Programmes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/fundraising",
    label: "Fundraising",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    href: "/admin/qr-codes",
    label: "QR Codes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="5" />
        <rect x="16" y="3" width="5" height="5" />
        <rect x="3" y="16" width="5" height="5" />
        <path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M13 7h.01M13 3h.01M13 13h.01M13 17h.01M13 21h.01M17 13h.01M21 13h.01" />
      </svg>
    ),
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: "/admin/administrators",
    label: "Administrators",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("smr_session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        {/* ── Desktop Sidebar ── */}
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-navy-950 lg:flex noise-layer">
          {/* Sidebar gradient accent */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(192,138,38,0.12),transparent)]" />

          {/* Brand */}
          <div className="relative p-6 pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 shadow-md shadow-gold-500/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-navy-950">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold-400/60">
                  Scan My Record
                </p>
                <p className="font-display text-sm font-semibold text-white">Admin</p>
              </div>
            </div>
            <div className="mt-5 h-px bg-gradient-to-r from-white/[0.06] via-white/[0.12] to-transparent" />
          </div>

          {/* Nav items */}
          <nav className="relative flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="admin-nav-item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
              >
                <span className="shrink-0 text-slate-500 transition-colors group-hover:text-gold-400">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="relative border-t border-white/[0.06] p-4">
            <LogoutButton />
          </div>
        </aside>

        {/* ── Main content area ── */}
        <div className="flex w-full flex-col lg:pl-64">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold-400 to-gold-600">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-navy-950">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="font-display text-sm font-semibold text-navy-900">SMR Admin</span>

            {/* Mobile nav scroll row */}
            <nav className="ml-2 flex flex-1 items-center gap-1 overflow-x-auto">
              {navItems.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-navy-900"
                >
                  <span className="h-3.5 w-3.5">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          {/* Page content */}
          <main className="flex-1 bg-slate-100 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
