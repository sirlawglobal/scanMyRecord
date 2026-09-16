import Link from "next/link";
import { verifyAndCompleteDonation } from "@/services/fundraising.service";

export default async function FundraisingVerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignSlug: string }>;
  searchParams: Promise<{ ref?: string; reference?: string; trxref?: string }>;
}) {
  const { campaignSlug } = await params;
  const resolvedParams = await searchParams;
  const ref = resolvedParams.reference || resolvedParams.ref || resolvedParams.trxref;

  const result = ref ? await verifyAndCompleteDonation(ref) : { ok: false as const, error: "No transaction reference provided." };

  const contributeAgainHref = `/fundraising/${campaignSlug}/contribute`;
  const campaignHref = `/fundraising/${campaignSlug}`;

  if (!result.ok) {
    return (
      <main>
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-elevated">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Payment status</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-navy-900">
              We couldn&apos;t verify your payment
            </h1>
            <p className="mt-4 text-slate-600">{result.error}</p>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Back to profile
              </Link>
              <Link
                href={contributeAgainHref}
                className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800"
              >
                Try again
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (result.status === "pending") {
    return (
      <main>
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-elevated">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Payment status</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-navy-900">Still processing</h1>
            <p className="mt-4 text-slate-600">
              We haven&apos;t received confirmation of your payment from Paystack yet. This can take a moment &mdash; please refresh this
              page shortly.
            </p>

            <div className="mt-6 rounded-2xl border border-gold-100 bg-gold-50 p-6 text-left">
              <p className="text-sm text-slate-500">Official Reference</p>
              <p className="mt-2 font-mono text-lg font-semibold text-navy-900">{ref}</p>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Back to profile
              </Link>
              <Link
                href={campaignHref}
                className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800"
              >
                View campaign
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (result.status === "failed") {
    return (
      <main>
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-elevated">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Payment status</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-navy-900">
              Your payment did not go through
            </h1>
            <p className="mt-4 text-slate-600">Please try again or use a different payment method.</p>

            <div className="mt-6 rounded-2xl border border-gold-100 bg-gold-50 p-6 text-left">
              <p className="text-sm text-slate-500">Reference</p>
              <p className="mt-2 font-mono text-lg font-semibold text-navy-900">{ref}</p>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Back to profile
              </Link>
              <Link
                href={contributeAgainHref}
                className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800"
              >
                Try again
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-elevated">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Payment status</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-navy-900">Thank you for your support</h1>
          <p className="mt-4 text-slate-600">
            Your contribution of{" "}
            <span className="font-display font-semibold text-navy-900">₦{result.amount.toLocaleString()}</span> has been
            verified and credited to the campaign drive.
          </p>

          <div className="mt-6 rounded-2xl border border-gold-100 bg-gold-50 p-6 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-gold-800">Official Receipt Reference</p>
            <p className="mt-2 font-mono text-xl font-bold text-navy-900">{ref}</p>
            <p className="mt-2 text-xs text-slate-500">
              An official receipt has been dispatched to your email address and logged in the public accountability registry.
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Back to profile
            </Link>
            <Link
              href={campaignHref}
              className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800"
            >
              View campaign
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
