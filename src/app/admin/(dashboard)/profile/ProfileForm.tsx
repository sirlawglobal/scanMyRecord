"use client";

import { useState } from "react";

type ProfileFormProps = {
  name: string;
  office: string;
  bio: string;
  constituency: string;
  servicePeriod?: string;
  profileImage?: string;
  socialLinks?: Record<string, string>;
};

export function ProfileForm({
  name,
  office,
  bio,
  constituency,
  servicePeriod = "2023 - 2027",
  profileImage = "",
  socialLinks = {},
}: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [imageUrl, setImageUrl] = useState(profileImage);
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
      setError(err instanceof Error ? err.message : "Failed to upload image. You can paste an image URL instead.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

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
      servicePeriod: String(formData.get("servicePeriod") ?? "").trim(),
      profileImage: imageUrl.trim(),
      socialLinks: {
        twitter: String(formData.get("twitter") ?? "").trim(),
        facebook: String(formData.get("facebook") ?? "").trim(),
        linkedin: String(formData.get("linkedin") ?? "").trim(),
        instagram: String(formData.get("instagram") ?? "").trim(),
      },
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
      {/* Profile Photo Section with Live Preview */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <label className="block text-sm font-bold text-slate-800">
          Hero Section Official Portrait Photo
        </label>
        <p className="mt-1 text-xs text-slate-500">
          This image appears prominently in the Hero section of the public site. Paste a public image URL or upload a photo.
        </p>

        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Avatar Preview */}
          <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-gold-400 bg-navy-950 shadow-md">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Profile Preview"
                className="h-full w-full object-cover"
                onError={() => setError("Image URL failed to load. Check that the URL is public and valid.")}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-slate-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="mt-1 text-[10px] leading-tight">No photo set</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Profile Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-navy-900 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {isUploading ? "Uploading..." : "Upload from computer"}
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
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Full name
          <input
            name="name"
            defaultValue={name}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Office / Position
          <input
            name="office"
            defaultValue={office}
            required
            placeholder="e.g. Member of Parliament, State Governor"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Constituency / Jurisdiction
          <input
            name="constituency"
            defaultValue={constituency}
            required
            placeholder="e.g. Ikeja Federal Constituency"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Service Period
          <input
            name="servicePeriod"
            defaultValue={servicePeriod}
            placeholder="e.g. 2023 - 2027"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Biography / Tagline
        <textarea
          name="bio"
          defaultValue={bio}
          rows={3}
          placeholder="Brief summary or mission statement shown on the public landing page"
          className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
        />
      </label>

      {/* Social Media Links */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-bold text-slate-800">Social Media Links</p>
        <p className="text-xs text-slate-500">Connected links displayed in the public footer and share dialogues.</p>
        
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Twitter / X URL</label>
            <input
              name="twitter"
              defaultValue={socialLinks.twitter || ""}
              placeholder="https://x.com/username"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-navy-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Facebook URL</label>
            <input
              name="facebook"
              defaultValue={socialLinks.facebook || ""}
              placeholder="https://facebook.com/username"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-navy-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">LinkedIn URL</label>
            <input
              name="linkedin"
              defaultValue={socialLinks.linkedin || ""}
              placeholder="https://linkedin.com/in/username"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-navy-900 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Instagram URL</label>
            <input
              name="instagram"
              defaultValue={socialLinks.instagram || ""}
              placeholder="https://instagram.com/username"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-navy-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {saved ? (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Profile saved successfully! Changes are now live on the public site.</span>
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="rounded-full bg-navy-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-950/20 transition hover:bg-navy-800 disabled:opacity-60"
        >
          {isSubmitting ? "Saving changes..." : "Save Profile"}
        </button>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-slate-500 hover:text-navy-900"
        >
          View live home page →
        </a>
      </div>
    </form>
  );
}
