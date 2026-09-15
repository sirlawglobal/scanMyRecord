"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registrationSchema } from "@/lib/validation/registration.schema";

export default function RegisterForm({ programmeSlug }: { programmeSlug: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      state: "",
      lga: "",
      customFields: {},
    },
  });

  const onSubmit = async (values: z.input<typeof registrationSchema>) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/programmes/${programmeSlug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.message ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(`/programmes/${programmeSlug}/register/confirmation?ref=${data.reference}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Full Name
          <input
            {...register("fullName")}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
          {errors.fullName && <span className="mt-1 block text-xs text-red-600">{errors.fullName.message}</span>}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Phone
          <input
            {...register("phone")}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
          {errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone.message}</span>}
        </label>

        <label className="text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            {...register("email")}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
          {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>}
        </label>

        <label className="text-sm font-medium text-slate-700">
          State
          <input
            {...register("state")}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
          {errors.state && <span className="mt-1 block text-xs text-red-600">{errors.state.message}</span>}
        </label>

        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          Address
          <input
            {...register("address")}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
          {errors.address && <span className="mt-1 block text-xs text-red-600">{errors.address.message}</span>}
        </label>

        <label className="text-sm font-medium text-slate-700 md:col-span-2">
          LGA
          <input
            {...register("lga")}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
          />
          {errors.lga && <span className="mt-1 block text-xs text-red-600">{errors.lga.message}</span>}
        </label>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white shadow-elevated transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit registration"}
      </button>
    </form>
  );
}
