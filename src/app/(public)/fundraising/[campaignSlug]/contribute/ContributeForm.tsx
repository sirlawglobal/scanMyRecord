"use client";

import { useState } from "react";

const presetAmounts = [5000, 10000, 25000, 50000, 100000];

export default function ContributeForm({ campaignSlug }: { campaignSlug: string }) {
  const [selectedAmount, setSelectedAmount] = useState<number>(25000);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!Number.isFinite(currentAmount) || currentAmount < 100) {
      setError("Contribution amount must be at least ₦100.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: name.trim(),
          donorEmail: email.trim(),
          amount: Math.round(currentAmount),
          campaignSlug,
          anonymous,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.message ?? "Failed to initialize Paystack checkout. Please try again.");
        return;
      }

      if (data?.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        setError("Paystack did not return a checkout URL. Please try again.");
      }
    } catch {
      setError("Network error connecting to payment gateway. Please check your connection.");
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
                  ? "bg-gold-500 text-navy-950 shadow-sm"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              ₦{amount.toLocaleString()}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Custom amount (₦)
          <input
            type="number"
            min={100}
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
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Chief Adebayo Adeleke"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Email address (for official receipt)
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-navy-900 focus:ring-navy-900"
        />
        <label htmlFor="anonymous" className="text-sm text-slate-600 select-none cursor-pointer">
          Make this contribution anonymous on public leaderboards
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 flex items-center justify-between">
        <span>Donation total:</span>
        <span className="font-display text-xl font-bold text-navy-900">
          ₦{Number.isFinite(currentAmount) && currentAmount > 0 ? currentAmount.toLocaleString() : "0"}
        </span>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-navy-900 px-6 py-3.5 text-sm font-bold text-white shadow-elevated transition hover:bg-navy-800 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Connecting to Paystack...</span>
          </>
        ) : (
          <span>Pay with Paystack &rarr;</span>
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Secured by Paystack. Card, Bank Transfer, USSD, and QR accepted.
      </p>
    </form>
  );
}
