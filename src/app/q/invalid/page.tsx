import Link from "next/link";

export default function InvalidQrPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-elevated">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600">QR code</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-navy-900">This link is no longer valid</h1>
        <p className="mt-4 text-slate-600">
          The code may be inactive, expired, or not available for public viewing.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
