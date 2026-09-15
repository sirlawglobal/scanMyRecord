"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TargetOption = {
  _id: string;
  title: string;
};

type QrCodeCreateFormProps = {
  politicians: TargetOption[];
  projects: TargetOption[];
  programmes: TargetOption[];
  fundraisingCampaigns: TargetOption[];
};

const TARGET_TYPE_OPTIONS = [
  { value: "politician", label: "Politician" },
  { value: "project", label: "Project" },
  { value: "programme", label: "Programme" },
  { value: "fundraising", label: "Fundraising" },
] as const;

type TargetType = (typeof TARGET_TYPE_OPTIONS)[number]["value"];

export function QrCodeCreateForm({ politicians, projects, programmes, fundraisingCampaigns }: QrCodeCreateFormProps) {
  const router = useRouter();
  const [targetType, setTargetType] = useState<TargetType>("politician");
  const [targetId, setTargetId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionsByType: Record<TargetType, TargetOption[]> = {
    politician: politicians,
    project: projects,
    programme: programmes,
    fundraising: fundraisingCampaigns,
  };

  const currentOptions = optionsByType[targetType];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!targetId) {
      setError("Please select a target.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message ?? "Failed to create QR code.");
        return;
      }

      setTargetId("");
      router.refresh();
    } catch {
      setError("Failed to create QR code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-3 md:items-end">
      <label className="block text-sm font-medium text-slate-700">
        Target type
        <select
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          value={targetType}
          onChange={(event) => {
            setTargetType(event.target.value as TargetType);
            setTargetId("");
          }}
        >
          {TARGET_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Target
        <select
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          value={targetId}
          onChange={(event) => setTargetId(event.target.value)}
        >
          <option value="">Select a target</option>
          {currentOptions.map((option) => (
            <option key={option._id} value={option._id}>
              {option.title}
            </option>
          ))}
        </select>
      </label>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-navy-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-navy-800 disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create QR code"}
        </button>
      </div>

      {error ? <p className="md:col-span-3 text-sm font-medium text-red-600">{error}</p> : null}
    </form>
  );
}

export function DisableQrCodeButton({ id }: { id: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDisable() {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/qr-codes/${id}/disable`, { method: "PATCH" });

      if (response.ok) {
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDisable}
      disabled={isSubmitting}
      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
    >
      {isSubmitting ? "Disabling..." : "Disable"}
    </button>
  );
}
