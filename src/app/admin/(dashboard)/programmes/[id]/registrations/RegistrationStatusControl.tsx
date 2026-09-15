"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "pending" | "approved" | "rejected";

export default function RegistrationStatusControl({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (nextStatus: Status) => {
    if (nextStatus === status || isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/registrations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        router.refresh();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isUpdating || status === "approved"}
        onClick={() => updateStatus("approved")}
        className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={isUpdating || status === "rejected"}
        onClick={() => updateStatus("rejected")}
        className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
