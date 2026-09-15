"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function ProgrammeForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const body = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      capacity: formData.get("capacity") ? String(formData.get("capacity")) : "",
      registrationDeadline: formData.get("registrationDeadline") ? String(formData.get("registrationDeadline")) : "",
      registrationOpen: formData.get("registrationOpen") === "on",
      images,
    };

    try {
      const response = await fetch("/api/admin/programmes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.message ?? "Failed to create programme.");
        return;
      }

      router.push("/admin/programmes");
      router.refresh();
    } catch {
      setError("Failed to create programme.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <label className="block text-sm font-medium text-slate-700">
        Programme name
        <input
          name="title"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          placeholder="Youth Skills Bootcamp"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Description
        <textarea
          name="description"
          className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          placeholder="Describe the programme"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Capacity
          <input
            name="capacity"
            type="number"
            min={0}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
            placeholder="Optional"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Registration deadline
          <input
            name="registrationDeadline"
            type="date"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input name="registrationOpen" type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300" />
        Registration open
      </label>

      <div>
        <span className="block text-sm font-medium text-slate-700">Images</span>
        <div className="mt-2">
          <ImageUploader value={images} onChange={setImages} />
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-navy-900 px-5 py-3.5 text-sm font-bold text-white shadow-elevated transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save programme"}
      </button>
    </form>
  );
}
