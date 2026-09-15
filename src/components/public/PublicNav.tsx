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
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-600">{appName}</span>
          <span className="font-display text-lg font-semibold text-navy-900">{profile.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-navy-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/#fundraising"
            className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800"
          >
            Support the work
          </Link>
        </div>

        <MobileNavToggle links={NAV_LINKS} />
      </div>
    </header>
  );
}
