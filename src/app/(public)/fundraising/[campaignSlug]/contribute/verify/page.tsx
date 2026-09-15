import Link from "next/link";
import { verifyAndCompleteDonation } from "@/services/fundraising.service";

export default async function FundraisingVerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignSlug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { campaignSlug } = await params;
  const { ref } = await searchParams;

  const result = ref ? await verifyAndCompleteDonation(ref) : { ok: false as const, error: "No reference provided." };

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
              We haven&apos;t received confirmation of your payment yet. This can take a moment — please refresh this
              page shortly.
            </p>

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
            <p className="mt-4 text-slate-600">Please try again, or use a different payment method.</p>

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
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Payment status</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-navy-900">Thank you for your support</h1>
          <p className="mt-4 text-slate-600">
            Your contribution of{" "}
            <span className="font-display font-semibold text-navy-900">₦{result.amount.toLocaleString()}</span> was
            received.
          </p>

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
