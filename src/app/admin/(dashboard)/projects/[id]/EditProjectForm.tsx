"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { DeleteActionButton } from "@/components/admin/DeleteActionButton";

type ProjectData = {
  _id: string;
  title: string;
  summary: string;
  category: string;
  status: string;
  year?: number;
  location: string;
  images: string[];
};

export function EditProjectForm({ project }: { project: ProjectData }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [images, setImages] = useState<string[]>(project.images || []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSaved(false);

    const formData = new FormData(event.currentTarget);

    const payload = {
      title: String(formData.get("title") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim(),
      category: String(formData.get("category") ?? ""),
      status: String(formData.get("status") ?? "").toLowerCase(),
      year: formData.get("year") ? Number(formData.get("year")) : undefined,
      location: String(formData.get("location") ?? "").trim(),
      images,
    };

    try {
      const response = await fetch(`/api/admin/projects/${project._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message ?? "Failed to update project.");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Failed to update project.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <label className="block text-sm font-medium text-slate-700">
        Project title
        <input
          name="title"
          defaultValue={project.title}
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Summary / Description
        <textarea
          name="summary"
          defaultValue={project.summary}
          className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Target Category / Sector
          <select
            name="category"
            defaultValue={project.category}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          >
            <option value="Healthcare">Healthcare</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Education">Education</option>
            <option value="Youth">Youth</option>
            <option value="Agriculture">Agriculture & Food</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Power & Energy">Power & Energy</option>
            <option value="Social Welfare">Social Welfare</option>
            <option value="Security">Security</option>
            <option value="Economy">Economy & Trade</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Status
          <select
            name="status"
            defaultValue={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          >
            <option value="Completed">Completed</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Proposed">Proposed</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Year
          <input
            name="year"
            type="number"
            defaultValue={project.year}
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Location / Community
          <input
            name="location"
            defaultValue={project.location}
            placeholder="e.g. Ikeja, Ward 4"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          />
        </label>
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700 mb-2">Project Images</span>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm font-medium text-emerald-600">Changes saved successfully!</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-navy-900 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-navy-950/20 transition hover:bg-navy-800 disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update Project"}
        </button>

        <DeleteActionButton
          endpoint={`/api/admin/projects/${project._id}`}
          itemName="this project"
          redirectUrl="/admin/projects"
          className="rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition"
        />
      </div>
    </form>
  );
}
