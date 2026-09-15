"use client";

import { useState } from "react";

type ProfileFormProps = {
  name: string;
  office: string;
  bio: string;
  constituency: string;
};

export function ProfileForm({ name, office, bio, constituency }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSaved(false);

    const formData = new FormData(event.currentTarget);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      office: String(formData.get("office") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim(),
      constituency: String(formData.get("constituency") ?? "").trim(),
    };

    try {
      const response = await fetch("/api/admin/politician", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message ?? "Failed to save profile.");
        return;
      }

      setSaved(true);
    } catch {
      setError("Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input name="name" defaultValue={name} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Office
          <input name="office" defaultValue={office} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Bio
        <textarea
          name="bio"
          defaultValue={bio}
          className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Constituency
        <input
          name="constituency"
          defaultValue={constituency}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
        />
      </label>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm font-medium text-green-600">Saved.</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-navy-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-navy-800 disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
