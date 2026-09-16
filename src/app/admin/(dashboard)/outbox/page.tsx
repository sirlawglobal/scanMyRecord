import { Metadata } from "next";
import { OutboxViewer } from "./OutboxViewer";

export const metadata: Metadata = {
  title: "Transactional Outbox & Email Queue | Admin Control",
  description: "Monitor, sweep, and retry transactional notification emails.",
};

export const dynamic = "force-dynamic";

export default function AdminOutboxPage() {
  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-600">
            <span>Civic Communications</span>
            <span>&bull;</span>
            <span>Native Outbox Dispatcher</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Transactional Email Delivery
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Guaranteed asynchronous email delivery powered by MongoDB Transactional Outbox.
          </p>
        </div>
      </div>

      <OutboxViewer />
    </div>
  );
}
