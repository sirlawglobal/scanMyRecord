"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CampaignForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/fundraising", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          targetAmount: Number(targetAmount),
          imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message ?? "Failed to create campaign.");
        return;
      }

      router.push("/admin/fundraising");
      router.refresh();
    } catch {
      setError("Failed to create campaign.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block text-sm font-medium text-slate-700">
        Campaign title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          placeholder="School renovation drive"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          placeholder="Describe the campaign"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Target amount
          <input
            type="number"
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
            required
            min={1}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="900000"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Image URL (optional)
          <input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="https://..."
          />
        </label>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-navy-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-navy-800 disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save campaign"}
      </button>
    </form>
  );
}
