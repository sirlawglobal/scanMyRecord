import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicNav />
      <main className="relative flex-1 overflow-hidden bg-navy-950 noise-layer">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(0,114,206,0.18),transparent)]" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center sm:py-36">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-200">Error 404</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">Page not found</h1>
          <p className="mt-4 text-base text-slate-200">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-gradient-to-r from-accent-500 to-accent-400 px-6 py-3 text-sm font-bold text-white shadow-md shadow-accent-500/25 transition hover:from-accent-600 hover:to-accent-500"
            >
              Back to home
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Browse projects
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
