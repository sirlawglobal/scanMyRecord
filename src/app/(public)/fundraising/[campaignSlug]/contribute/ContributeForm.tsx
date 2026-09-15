"use client";

import { useState } from "react";

const presetAmounts = [5000, 10000, 25000, 50000, 100000];

export default function ContributeForm({ campaignSlug }: { campaignSlug: string }) {
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: name,
          donorEmail: email,
          amount: currentAmount,
          campaignSlug,
          anonymous: false,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message ?? "Failed to start your contribution. Please try again.");
        return;
      }

      const data = await response.json();
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Failed to start your contribution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-700">Choose an amount</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedAmount === amount && !customAmount
                  ? "bg-gold-500 text-navy-950"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              ₦{amount.toLocaleString()}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Custom amount
          <input
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            placeholder="Enter another amount"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Full name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
        </label>
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        Donation total:{" "}
        <span className="font-display font-semibold text-navy-900">
          ₦{Number.isFinite(currentAmount) && currentAmount > 0 ? currentAmount.toLocaleString() : "0"}
        </span>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800 disabled:opacity-60"
      >
        {isSubmitting ? "Redirecting to payment..." : "Continue to payment"}
      </button>
    </form>
  );
}
