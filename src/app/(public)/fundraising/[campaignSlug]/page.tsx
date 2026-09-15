import Link from "next/link";

import { getPublicFundraisingCampaignBySlug } from "@/lib/site/content";
import Reveal from "@/components/public/Reveal";

export default async function FundraisingCampaignPage({
  params,
}: {
  params: Promise<{ campaignSlug: string }>;
}) {
  const { campaignSlug } = await params;
  const campaign = await getPublicFundraisingCampaignBySlug(campaignSlug);

  if (!campaign) {
    return (
      <main>
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-elevated">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Fundraising</p>
            <h1 className="mt-3 font-display text-4xl font-semibold text-navy-900">Campaign not found</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              This fundraising campaign is not available yet.
            </p>
            <Link
              href="/fundraising"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800"
            >
              Back to campaigns
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const progress = campaign.targetAmount > 0 ? (campaign.raisedAmount / campaign.targetAmount) * 100 : 0;
  const impact = [
    "Community support through secure, transparent fundraising.",
    "All funds are tracked and reported publicly.",
  ];

  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <Link href="/fundraising" className="text-sm font-semibold text-slate-500 transition hover:text-navy-900">
            ← Back to campaigns
          </Link>
        </Reveal>

        <Reveal delay={0.05} className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Fundraising</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-navy-900 sm:text-5xl">{campaign.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {campaign.description || "No description added yet."}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-elevated">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Raised so far</p>
              <p className="font-display text-3xl font-semibold text-navy-900">
                ₦{campaign.raisedAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Target</p>
              <p className="font-display text-xl font-semibold text-navy-900">
                ₦{campaign.targetAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>{Math.round(progress)}% funded</span>
            <span className="capitalize">{campaign.status}</span>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy-900">Why this matters</h2>
            <ul className="mt-4 space-y-3 text-slate-600">
              {impact.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gold-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-elevated">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Support this drive</p>
            <p className="mt-3 text-slate-600">
              Contribute directly to this campaign — every naira is tracked and reported publicly.
            </p>

            <Link
              href={`/fundraising/${campaign.slug}/contribute`}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800"
            >
              Contribute now
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
