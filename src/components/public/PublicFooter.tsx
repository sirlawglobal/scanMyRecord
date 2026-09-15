import Link from "next/link";
import { getPublicProfileConfig } from "@/lib/site/public-profile-server";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Scan My Record";

export default async function PublicFooter() {
  const profile = await getPublicProfileConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="font-display text-xl font-semibold text-navy-900">{profile.name}</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{profile.office} · {profile.constituency}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Explore</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-slate-600">
              <Link href="/projects" className="transition hover:text-navy-900">Projects</Link>
              <Link href="/programmes" className="transition hover:text-navy-900">Programmes</Link>
              <Link href="/fundraising" className="transition hover:text-navy-900">Fundraising</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Connect</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-slate-600">
              <a href="#" className="transition hover:text-navy-900">Facebook</a>
              <a href="#" className="transition hover:text-navy-900">X (Twitter)</a>
              <a href="#" className="transition hover:text-navy-900">Instagram</a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {appName}. Public accountability record.</p>
          <p>Verified by {appName} · One scan, four years of impact.</p>
        </div>
      </div>
    </footer>
  );
}
