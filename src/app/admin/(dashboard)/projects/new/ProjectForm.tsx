"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";

export function ProjectForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

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
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message ?? "Failed to create project.");
        return;
      }

      router.push("/admin/projects");
      router.refresh();
    } catch {
      setError("Failed to create project.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block text-sm font-medium text-slate-700">
        Project title
        <input
          name="title"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          placeholder="School ICT lab expansion"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          name="summary"
          className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          placeholder="Describe the project"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Category
          <select name="category" defaultValue="Healthcare" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5">
            <option>Healthcare</option>
            <option>Infrastructure</option>
            <option>Education</option>
            <option>Youth</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Status
          <select name="status" defaultValue="Proposed" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5">
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
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="2024"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Location
          <input
            name="location"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Ward 4, Lagos"
          />
        </label>
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700">Images</span>
        <div className="mt-2">
          <ImageUploader value={images} onChange={setImages} />
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-navy-900 px-5 py-3.5 text-sm font-bold text-white shadow-elevated transition hover:bg-navy-800 disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save project"}
      </button>
    </form>
  );
}
