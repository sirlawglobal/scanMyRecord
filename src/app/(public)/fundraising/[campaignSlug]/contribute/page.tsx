import Link from "next/link";

import { getPublicFundraisingCampaignBySlug } from "@/lib/site/content";
import Reveal from "@/components/public/Reveal";
import ContributeForm from "./ContributeForm";

export default async function FundraisingContributePage({
  params,
}: {
  params: Promise<{ campaignSlug: string }>;
}) {
  const { campaignSlug } = await params;
  const campaign = await getPublicFundraisingCampaignBySlug(campaignSlug);

  if (!campaign) {
    return (
      <main>
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-elevated">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Contribute</p>
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

  return (
    <main>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-elevated">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Contribute</p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-navy-900">{campaign.title}</h1>

            <ContributeForm campaignSlug={campaign.slug} />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
