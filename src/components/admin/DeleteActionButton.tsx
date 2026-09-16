"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteActionButtonProps = {
  endpoint: string;
  itemName: string;
  redirectUrl?: string;
  buttonText?: string;
  className?: string;
};

export function DeleteActionButton({
  endpoint,
  itemName,
  redirectUrl,
  buttonText = "Delete",
  className = "",
}: DeleteActionButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? "Failed to delete item.");
      }

      if (redirectUrl) {
        router.push(redirectUrl);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting");
      setIsDeleting(false);
      setIsConfirming(false);
    }
  }

  if (isConfirming) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        <span className="text-slate-600 font-medium">Delete {itemName}?</span>
        <button
          type="button"
          disabled={isDeleting}
          onClick={handleDelete}
          className="rounded bg-red-600 px-2 py-1 font-bold text-white shadow hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Yes, Delete"}
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => setIsConfirming(false)}
          className="rounded border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className={
        className ||
        "inline-flex items-center gap-1 text-xs font-semibold text-red-600 transition hover:text-red-800"
      }
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
      {buttonText}
    </button>
  );
}
