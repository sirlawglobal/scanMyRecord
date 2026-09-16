"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DeleteActionButton } from "@/components/admin/DeleteActionButton";

type CampaignData = {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  status: string;
  imageUrl?: string;
};

export function EditCampaignForm({ campaign }: { campaign: CampaignData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState(campaign.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message ?? "Upload failed. You can paste an image URL directly instead.");
      }

      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const body = {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      targetAmount: Number(formData.get("targetAmount")),
      status: String(formData.get("status") ?? "active"),
      imageUrl: imageUrl.trim(),
    };

    try {
      const response = await fetch(`/api/admin/fundraising/${campaign._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.message ?? "Failed to update campaign.");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Failed to update campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <label className="block text-sm font-medium text-slate-700">
        Campaign Title
        <input
          name="title"
          defaultValue={campaign.title}
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          name="description"
          defaultValue={campaign.description}
          className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Target Amount (NGN)
          <input
            name="targetAmount"
            type="number"
            min={1}
            defaultValue={campaign.targetAmount}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Status
          <select
            name="status"
            defaultValue={campaign.status}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </label>
      </div>

      {/* Campaign Image */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label className="block text-sm font-semibold text-slate-800">Campaign Image</label>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
          {imageUrl && (
            <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/campaign-banner.jpg"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none"
            />
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                {isUploading ? "Uploading..." : "Upload File"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm font-medium text-emerald-600">Campaign updated successfully!</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="rounded-full bg-navy-900 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-navy-950/20 transition hover:bg-navy-800 disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update Campaign"}
        </button>

        <DeleteActionButton
          endpoint={`/api/admin/fundraising/${campaign._id}`}
          itemName="this campaign"
          redirectUrl="/admin/fundraising"
          className="rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition"
        />
      </div>
    </form>
  );
}
