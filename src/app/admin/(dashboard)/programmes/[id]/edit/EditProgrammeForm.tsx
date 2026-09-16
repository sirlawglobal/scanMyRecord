"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { DeleteActionButton } from "@/components/admin/DeleteActionButton";

type ProgrammeData = {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  registrationOpen: boolean;
  capacity?: number | null;
  registrationDeadline?: string | null;
  images: string[];
};

export function EditProgrammeForm({ programme }: { programme: ProgrammeData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>(programme.images || []);

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
      category: String(formData.get("category") ?? "General").trim(),
      status: String(formData.get("status") ?? "active"),
      capacity: formData.get("capacity") ? String(formData.get("capacity")) : "",
      registrationDeadline: formData.get("registrationDeadline") ? String(formData.get("registrationDeadline")) : "",
      registrationOpen: formData.get("registrationOpen") === "on",
      images,
    };

    try {
      const response = await fetch(`/api/admin/programmes/${programme._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.message ?? "Failed to update programme.");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Failed to update programme.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <label className="block text-sm font-medium text-slate-700">
        Programme name
        <input
          name="title"
          defaultValue={programme.title}
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          name="description"
          defaultValue={programme.description}
          className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Target Focus Category
          <select
            name="category"
            defaultValue={programme.category || "Youth Empowerment"}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          >
            <option value="Youth Empowerment">Youth Empowerment</option>
            <option value="Education & Scholarships">Education & Scholarships</option>
            <option value="Healthcare & Wellness">Healthcare & Wellness</option>
            <option value="Skill Acquisition">Skill Acquisition</option>
            <option value="Agriculture & Food Security">Agriculture & Food Security</option>
            <option value="Women Empowerment">Women Empowerment</option>
            <option value="Community Welfare">Community Welfare</option>
            <option value="Technology & Innovation">Technology & Innovation</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="General">General Community Support</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Status
          <select
            name="status"
            defaultValue={programme.status}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Capacity (Optional)
          <input
            name="capacity"
            type="number"
            min={0}
            defaultValue={programme.capacity ?? ""}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Registration deadline
          <input
            name="registrationDeadline"
            type="date"
            defaultValue={programme.registrationDeadline ? programme.registrationDeadline.substring(0, 10) : ""}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-navy-900 focus:outline-none"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          name="registrationOpen"
          type="checkbox"
          defaultChecked={programme.registrationOpen}
          className="h-4 w-4 rounded border-slate-300 text-navy-900 focus:ring-navy-900"
        />
        Registration open for public submissions
      </label>

      <div>
        <span className="block text-sm font-medium text-slate-700 mb-2">Programme Cover & Media</span>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm font-medium text-emerald-600">Programme updated successfully!</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-navy-900 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-navy-950/20 transition hover:bg-navy-800 disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update Programme"}
        </button>

        <DeleteActionButton
          endpoint={`/api/admin/programmes/${programme._id}`}
          itemName="this programme"
          redirectUrl="/admin/programmes"
          className="rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition"
        />
      </div>
    </form>
  );
}
