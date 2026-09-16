"use client";

import { useState, useEffect, useTransition } from "react";

export type OutboxItem = {
  _id: string;
  recipient: string;
  subject: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "sent" | "failed";
  attempts: number;
  lastError?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
};

type OutboxCounts = {
  total: number;
  pending: number;
  sent: number;
  failed: number;
};

type PreviewModalData = {
  item: OutboxItem;
  html: string;
  text: string;
};

export function OutboxViewer() {
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [counts, setCounts] = useState<OutboxCounts>({ total: 0, pending: 0, sent: 0, failed: 0 });
  const [isSmtpConfigured, setIsSmtpConfigured] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "sent" | "failed">("all");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [sweeping, setSweeping] = useState(false);
  const [sweepMessage, setSweepMessage] = useState<string | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Email Preview Modal State
  const [previewData, setPreviewData] = useState<PreviewModalData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState<"visual" | "json">("visual");

  const [, startTransition] = useTransition();

  async function fetchOutbox() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/outbox", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.outbox || []);
        setCounts(data.counts || { total: 0, pending: 0, sent: 0, failed: 0 });
        setIsSmtpConfigured(Boolean(data.isSmtpConfigured));
      }
    } catch (err) {
      console.error("Failed to load outbox:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOutbox();
  }, []);

  async function handleRetry(id: string) {
    try {
      setRetryingId(id);
      const res = await fetch(`/api/admin/outbox/${id}/retry`, {
        method: "POST",
      });
      if (res.ok) {
        startTransition(() => {
          fetchOutbox();
        });
      }
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setRetryingId(null);
    }
  }

  async function handleOpenPreview(id: string) {
    try {
      setPreviewLoading(true);
      const res = await fetch(`/api/admin/outbox/${id}/preview`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPreviewData(data);
      }
    } catch (err) {
      console.error("Failed to load email preview:", err);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleRunSweeper() {
    try {
      setSweeping(true);
      setSweepMessage(null);
      const res = await fetch("/api/cron/outbox", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSweepMessage(data.message || "Sweeper finished successfully.");
        fetchOutbox();
      } else {
        setSweepMessage("Sweeper error occurred.");
      }
    } catch {
      setSweepMessage("Failed to run sweeper.");
    } finally {
      setSweeping(false);
    }
  }

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Logged</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-slate-900">{counts.total}</p>
          <p className="mt-1 text-xs text-slate-500">All transactional attempts</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Sent / Delivered</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-emerald-600">{counts.sent}</p>
          <p className="mt-1 text-xs text-emerald-600/80">Successfully dispatched</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">In Queue</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-amber-600">{counts.pending}</p>
          <p className="mt-1 text-xs text-amber-600/80">Pending asynchronous delivery</p>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Failed / Retrying</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </span>
          </div>
          <p className="mt-3 text-2xl font-black text-rose-600">{counts.failed}</p>
          <p className="mt-1 text-xs text-rose-600/80">Retry attempts remaining</p>
        </div>
      </div>

      {/* ── Mock Mode vs Live SMTP Info Banner ── */}
      {!isSmtpConfigured && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 text-amber-900 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 text-sm font-bold">
                ⚠️
              </span>
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-sm text-amber-950">
                  Development / Mock Delivery Mode Active
                </p>
                <p className="text-amber-800 leading-relaxed">
                  No SMTP credentials (<code className="bg-amber-200/60 px-1.5 py-0.5 rounded font-mono font-semibold">SMTP_HOST</code>, <code className="bg-amber-200/60 px-1.5 py-0.5 rounded font-mono font-semibold">SMTP_USER</code>, <code className="bg-amber-200/60 px-1.5 py-0.5 rounded font-mono font-semibold">SMTP_PASS</code>) are configured in your <code className="bg-amber-200/60 px-1.5 py-0.5 rounded font-mono font-semibold">.env</code>.
                </p>
                <p className="text-amber-700">
                  All transactional emails are formatted, verified, queued in MongoDB, and logged safely. You can click <strong>&quot;Preview Email&quot;</strong> on any row below to view the exact HTML email!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigGuide(!showConfigGuide)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-200 transition"
            >
              {showConfigGuide ? "Hide Setup Guide" : "How to Enable Real Emails →"}
            </button>
          </div>

          {/* Quick Setup Guide Drawer */}
          {showConfigGuide && (
            <div className="mt-4 border-t border-amber-200/80 pt-4 text-xs space-y-3">
              <p className="font-bold text-amber-950">
                To send physical emails to your actual Gmail or inbox, add this to your <code className="bg-amber-200/60 px-1.5 py-0.5 rounded font-mono">.env</code> file:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-xs font-mono text-[11px] text-slate-800 space-y-1">
                  <p className="font-sans font-bold text-slate-900 mb-1">Option 1: Gmail (Quickest)</p>
                  <p>SMTP_HOST=smtp.gmail.com</p>
                  <p>SMTP_PORT=587</p>
                  <p>SMTP_USER=your-email@gmail.com</p>
                  <p>SMTP_PASS=your-google-app-password</p>
                  <p>SMTP_FROM=&quot;Scan My Record &lt;your-email@gmail.com&gt;&quot;</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-xs font-mono text-[11px] text-slate-800 space-y-1">
                  <p className="font-sans font-bold text-slate-900 mb-1">Option 2: Resend / Brevo (Free Tier)</p>
                  <p>SMTP_HOST=smtp.resend.com</p>
                  <p>SMTP_PORT=587</p>
                  <p>SMTP_USER=resend</p>
                  <p>SMTP_PASS=re_your_api_key</p>
                  <p>SMTP_FROM=&quot;Scan My Record &lt;onboarding@resend.dev&gt;&quot;</p>
                </div>
              </div>
              <p className="text-[11px] text-amber-800">
                After saving <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono">.env</code>, restart the dev server (<code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono">npm run dev</code>), then click <strong>&quot;Retry&quot;</strong> on any registration below to deliver the email immediately.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Control Action Bar ── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "pending", "sent", "failed"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                filter === tab
                  ? "bg-navy-950 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab} {tab === "all" ? `(${counts.total})` : `(${counts[tab]})`}
            </button>
          ))}
        </div>

        {/* Sweeper Trigger & Refresh */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOutbox}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={loading ? "animate-spin" : ""}
            >
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>

          <button
            type="button"
            onClick={handleRunSweeper}
            disabled={sweeping}
            className="flex items-center gap-2 rounded-xl bg-navy-950 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-navy-900 disabled:opacity-50"
          >
            {sweeping ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Sweeping Queue...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Run Outbox Sweeper
              </>
            )}
          </button>
        </div>
      </div>

      {sweepMessage && (
        <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs font-semibold text-sky-800">
          <span>⚡ {sweepMessage}</span>
          <button type="button" onClick={() => setSweepMessage(null)} className="text-sky-600 hover:text-sky-900">
            &times;
          </button>
        </div>
      )}

      {/* ── Outbox Table / List ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && items.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <svg className="mx-auto h-8 w-8 animate-spin text-navy-950" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="mt-3 text-sm font-medium">Loading transactional outbox queue...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <p className="mt-3 font-semibold text-slate-700">No emails found</p>
            <p className="mt-1 text-xs text-slate-400">
              {filter === "all"
                ? "When citizens register for programmes, outbound emails will be queued and logged here."
                : `No emails matching the "${filter}" filter.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Recipient</th>
                  <th className="px-5 py-3.5">Subject & Event</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Attempts</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 font-bold text-xs text-slate-700 uppercase">
                          {item.recipient.charAt(0)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900">{item.recipient}</p>
                          <p className="text-xs text-slate-400 font-mono">
                            {String(item.payload?.reference || "N/A")}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800 line-clamp-1">{item.subject}</p>
                      <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {item.eventType}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.status === "sent" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Sent
                        </span>
                      )}
                      {item.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Pending
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                          Processing
                        </span>
                      )}
                      {item.status === "failed" && (
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Failed
                          </span>
                          {item.lastError && (
                            <p className="mt-1 text-[11px] text-rose-600 line-clamp-1" title={item.lastError}>
                              {item.lastError}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-medium text-slate-600">
                        {item.attempts} / 5
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(item._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-navy-950 transition"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRetry(item._id)}
                          disabled={retryingId === item._id}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-navy-950 disabled:opacity-50"
                        >
                          {retryingId === item._id ? "Retrying..." : "Retry"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Visual Email Preview Modal / Drawer ── */}
      {previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6">
          <div className="relative flex h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-navy-950 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    {previewData.item.eventType}
                  </span>
                  <span className="font-mono text-xs font-bold text-gold-600">
                    {String(previewData.item.payload?.reference || "")}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                  {previewData.item.subject}
                </h3>
                <p className="text-xs text-slate-500">
                  To: <span className="font-semibold text-slate-700">{previewData.item.recipient}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Visual / JSON toggle */}
                <div className="flex rounded-xl bg-slate-200 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewTab("visual")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                      previewTab === "visual" ? "bg-white text-navy-950 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    HTML Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab("json")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                      previewTab === "json" ? "bg-white text-navy-950 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    JSON Data
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewData(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
              {previewTab === "visual" ? (
                <div className="mx-auto max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
                  <div
                    dangerouslySetInnerHTML={{ __html: previewData.html }}
                    className="email-content-preview"
                  />
                </div>
              ) : (
                <pre className="rounded-xl border border-slate-300 bg-navy-950 p-4 font-mono text-xs text-gold-300 overflow-x-auto">
                  {JSON.stringify(previewData.item, null, 2)}
                </pre>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3.5 text-xs text-slate-500">
              <span>
                Status: <strong className="uppercase text-slate-800">{previewData.item.status}</strong> &bull; Attempts: {previewData.item.attempts}/5
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewData(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRetry(previewData.item._id);
                    setPreviewData(null);
                  }}
                  className="rounded-xl bg-navy-950 px-4 py-2 font-bold text-white shadow-sm hover:bg-navy-900 transition"
                >
                  Trigger Resend / Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
