"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewAdminForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? "ADMIN"),
    };

    try {
      const response = await fetch("/api/admin/administrators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message ?? "Failed to create administrator.");
        return;
      }

      form.reset();
      router.refresh();
    } catch {
      setError("Failed to create administrator.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
      <label className="block text-sm font-medium text-slate-700">
        Name
        <input name="name" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Email
        <input name="email" type="email" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5" />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5"
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Role
        <select name="role" defaultValue="ADMIN" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5">
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super admin</option>
        </select>
      </label>

      {error ? <p className="md:col-span-2 text-sm font-medium text-red-600">{error}</p> : null}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-navy-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-navy-800 disabled:opacity-60 md:w-auto"
        >
          {isSubmitting ? "Creating..." : "Create administrator"}
        </button>
      </div>
    </form>
  );
}
