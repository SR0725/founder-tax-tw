"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_LABEL, type Draft } from "@/lib/draft";

const SAMPLE = "/sample-data/kuroshio-bank-2026.csv";

type Status = "idle" | "working" | "done";

export default function DraftPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  async function run(name: string, csv: string) {
    setStatus("working");
    setFileName(name);
    setError("");
    setDraft(null);
    setChecked({});
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setStatus("idle");
        return;
      }
      setDraft(data as Draft);
      setStatus("done");
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setStatus("idle");
    }
  }

  async function useSample() {
    const csv = await fetch(SAMPLE).then((r) => r.text());
    run("kuroshio-bank-2026.csv", csv);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    run(file.name, await file.text());
  }

  const flagged = draft?.transactions.filter((t) => t.confidence === "low") ?? [];
  const reportable = draft?.transactions.filter((t) => t.reportable) ?? [];
  const doneCount = draft ? draft.checklist.filter((c) => checked[c.id]).length : 0;
  const allDone = draft ? doneCount === draft.checklist.length : false;

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 text-stone-900 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-stone-500 underline">
          ← All filings
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Form 5472 for Kuroshio Studio LLC</h1>
        <p className="mt-1 text-stone-500">
          Due April 15, 2027 · $25,000 if missed · foreign-owned single-member LLC
        </p>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold">1. Give us the bank statement</h2>
          <p className="mt-1 text-sm text-stone-500">
            A CSV export with date, description and amount. We find every transaction between you and the
            company, which is what this form reports.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white">
              Upload CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
            <button onClick={useSample} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm">
              Use the sample statement
            </button>
            {fileName && <span className="text-sm text-stone-500">{fileName}</span>}
          </div>
          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}
          {status === "working" && (
            <p className="mt-4 text-sm text-stone-600" aria-live="polite">
              Reading transactions and drafting the form…
            </p>
          )}
        </section>

        {draft && (
          <>
            <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold">2. Your draft</h2>
                <span
                  data-testid="source"
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    draft.source === "claude" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {draft.sourceNote}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500">
                Read {draft.transactions.length} transactions. {reportable.length} are reportable.{" "}
                <span className="font-medium text-amber-800">{flagged.length} need a decision.</span>
              </p>

              <dl className="mt-4 divide-y divide-stone-100">
                {draft.fields.map((f, i) => (
                  <div key={i} className={`grid gap-1 py-3 sm:grid-cols-[1fr_auto] ${f.needsReview ? "bg-amber-50/70 -mx-3 px-3 rounded-lg" : ""}`}>
                    <div>
                      <dt className="text-xs text-stone-400">{f.section}</dt>
                      <dd className="font-medium">{f.label}</dd>
                      <dd className="mt-0.5 text-sm text-stone-500">{f.basis}</dd>
                    </div>
                    <dd className="text-right">
                      <span className="font-mono text-[15px]">{f.value}</span>
                      {f.needsReview && (
                        <span className="mt-1 block text-xs font-medium text-amber-800">Needs review</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <h3 className="mt-6 text-sm font-semibold">Transactions behind the numbers</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                {reportable.concat(draft.transactions.filter((t) => !t.reportable && t.confidence === "low")).map((t) => (
                  <li key={t.id} className="rounded-lg border border-stone-100 px-3 py-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span>
                        <span className="text-stone-400">{t.date}</span> {t.description}
                      </span>
                      <span className="font-mono">{t.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                    </div>
                    <div className="mt-0.5 text-stone-600">
                      <span className={`mr-2 rounded-full px-2 py-0.5 text-xs ${t.confidence === "low" ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-700"}`}>
                        {CATEGORY_LABEL[t.category]}
                        {t.confidence === "low" ? " · unsure" : ""}
                      </span>
                      {t.reason}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="font-semibold">
                3. Review checklist{" "}
                <span className="font-normal text-stone-400" data-testid="progress">
                  · {doneCount} of {draft.checklist.length}
                </span>
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Written for a reviewer without a CPA licence. A licensed CPA signs only after every box is ticked.
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {draft.checklist.map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 px-4 py-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={Boolean(checked[c.id])}
                        onChange={(e) => setChecked((p) => ({ ...p, [c.id]: e.target.checked }))}
                      />
                      <span>
                        <span className="block font-medium">{c.text}</span>
                        <span className="block text-sm text-stone-500">{c.detail}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <button
                disabled={!allDone}
                className="mt-5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {allDone ? "Ready for CPA signature" : `${draft.checklist.length - doneCount} checks left before CPA signature`}
              </button>
            </section>
          </>
        )}

        <p className="mt-10 pb-6 text-xs text-stone-400">
          Not tax advice. This is a draft for professional review, built on synthetic data. Nothing is filed
          from this screen.
        </p>
      </div>
    </div>
  );
}
