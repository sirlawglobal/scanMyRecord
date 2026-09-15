import Link from "next/link";

import { getPublicFundraisingCampaignList } from "@/lib/site/content";
import Reveal from "@/components/public/Reveal";

export default async function FundraisingListPage() {
  const campaigns = await getPublicFundraisingCampaignList();
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active");

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">Fundraising</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-navy-900 sm:text-5xl">
            Active community drives
          </h1>
        </Reveal>

        {activeCampaigns.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">
            No active fundraising campaigns are available yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {activeCampaigns.map((campaign, index) => {
              const progress = campaign.targetAmount > 0 ? (campaign.raisedAmount / campaign.targetAmount) * 100 : 0;

              return (
                <Reveal key={campaign._id} delay={index * 0.05}>
                  <Link
                    href={`/fundraising/${campaign.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-elevated transition hover:-translate-y-1 hover:shadow-elevated-lg"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                      {campaign.imageUrl ? (
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-navy-900 to-navy-700 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                          Fundraising
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-lg font-semibold text-navy-900">{campaign.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {campaign.description || "No description added yet."}
                      </p>

                      <div className="mt-5">
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gold-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <p className="mt-3 font-display text-sm text-slate-700">
                          <span className="font-semibold text-navy-900">
                            ₦{campaign.raisedAmount.toLocaleString()}
                          </span>{" "}
                          raised of ₦{campaign.targetAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
