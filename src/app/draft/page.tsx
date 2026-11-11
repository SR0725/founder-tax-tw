"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORY_LABEL, type Draft } from "@/lib/draft";
import { twd, useLang } from "@/lib/i18n";
import { Shell } from "@/components/Shell";

const SAMPLE = "/sample-data/kuroshio-bank-2026.csv";

const T = {
  en: {
    back: "← All filings",
    title: "Form 5472 for Kuroshio Studio LLC",
    meta: "Due April 15, 2027 · $25,000 if missed · foreign-owned single-member LLC",
    step1: "1. Give us the bank statement",
    step1Sub:
      "A CSV export with date, description and amount. We find every transaction between you and the company, which is what this form reports.",
    upload: "Upload CSV",
    sample: "Use the sample statement",
    working: "Reading transactions and drafting the form…",
    serverDown: "We couldn't reach the server. Check your connection and try again.",
    generic: "Something went wrong. Try again.",
    step2: "2. Your draft",
    summary: (n: number, r: number) => `Read ${n} transactions. ${r} are reportable.`,
    decide: (n: number) => `${n} need a decision.`,
    needsReview: "Needs review",
    behind: "Transactions behind the numbers",
    unsure: "unsure",
    step3: "3. Review checklist",
    of: (a: number, b: number) => `${a} of ${b}`,
    step3Sub: "Written for a reviewer without a CPA licence. A licensed CPA signs only after every box is ticked.",
    ready: "Ready for CPA signature",
    left: (n: number) => `${n} checks left before CPA signature`,
    disclaimer:
      "Not tax advice. This is a draft for professional review, built on synthetic data. Nothing is filed from this screen.",
  },
  zh: {
    back: "← 所有申報項目",
    title: "Kuroshio Studio LLC 的 Form 5472",
    meta: `期限 2027 年 4 月 15 日 · 沒報罰 25,000 美元（約 ${twd(25000)}）· 外國人獨資的 LLC`,
    step1: "1. 給我們銀行對帳單",
    step1Sub: "CSV 匯出檔，要有日期、說明、金額三欄。我們會找出你和公司之間的每一筆往來，這張表要申報的就是這些。",
    upload: "上傳 CSV",
    sample: "使用範例對帳單",
    working: "正在讀取交易並填寫草稿…",
    serverDown: "連不上伺服器。請檢查網路後再試一次。",
    generic: "發生錯誤，請再試一次。",
    step2: "2. 你的申報草稿",
    summary: (n: number, r: number) => `讀取 ${n} 筆交易，其中 ${r} 筆需要申報。`,
    decide: (n: number) => `${n} 筆需要你判斷。`,
    needsReview: "需要確認",
    behind: "數字背後的交易",
    unsure: "不確定",
    step3: "3. 審核清單",
    of: (a: number, b: number) => `${a} / ${b}`,
    step3Sub: "這份清單是寫給沒有會計師執照的審核員看的。每一項都打勾之後，才交給有執照的美國會計師簽名。",
    ready: "可以送會計師簽名了",
    left: (n: number) => `還有 ${n} 項要確認，才能送會計師簽名`,
    disclaimer: "本服務不是稅務建議。這是供專業人士審核的草稿，使用虛構資料製作。這個畫面不會送出任何申報。",
  },
};

type Status = "idle" | "working" | "done";

export default function DraftPage() {
  const [lang, setLang] = useLang();
  const t = T[lang];
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
        body: JSON.stringify({ csv, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.generic);
        setStatus("idle");
        return;
      }
      setDraft(data as Draft);
      setStatus("done");
    } catch {
      setError(t.serverDown);
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

  const flagged = draft?.transactions.filter((x) => x.confidence === "low") ?? [];
  const reportable = draft?.transactions.filter((x) => x.reportable) ?? [];
  const doneCount = draft ? draft.checklist.filter((c) => checked[c.id]).length : 0;
  const allDone = draft ? doneCount === draft.checklist.length : false;

  return (
    <Shell lang={lang} onLang={setLang} title={t.title} active="filings">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
          {t.back}
        </Link>
        <p className="mt-2 text-sm text-neutral-500">{t.meta}</p>

        <section className="mt-4 rounded-xl border border-neutral-200 p-5">
          <h2 className="font-semibold">{t.step1}</h2>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">{t.step1Sub}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700">
              {t.upload}
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            <button onClick={useSample} className="rounded-lg bg-white px-4 py-2 text-sm font-medium ring-1 ring-neutral-300 hover:ring-neutral-500">
              {t.sample}
            </button>
            {fileName && <span className="text-sm text-neutral-500">{fileName}</span>}
          </div>
          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}
          {status === "working" && (
            <p className="mt-4 flex items-center gap-2 text-sm text-neutral-600" aria-live="polite">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
              {t.working}
            </p>
          )}
        </section>

        {draft && (
          <>
            <section className="mt-4 rounded-xl border border-neutral-200 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold">{t.step2}</h2>
                <span
                  data-testid="source"
                  className={`rounded-md px-1.5 py-1 text-xs font-medium ${
                    draft.source === "claude" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {draft.sourceNote}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                {t.summary(draft.transactions.length, reportable.length)}{" "}
                <span className="font-medium text-orange-800">{t.decide(flagged.length)}</span>
              </p>

              <dl className="mt-4 divide-y divide-neutral-100">
                {draft.fields.map((f, i) => (
                  <div key={i} className={`grid gap-1 py-3 sm:grid-cols-[1fr_auto] ${f.needsReview ? "-mx-3 rounded-lg bg-orange-50/70 px-3" : ""}`}>
                    <div>
                      <dt className="text-xs text-neutral-400">{f.section}</dt>
                      <dd className="font-medium">{f.label}</dd>
                      <dd className="mt-0.5 text-sm text-neutral-500">{f.basis}</dd>
                    </div>
                    <dd className="text-right">
                      <span className="font-mono text-[15px] tabular-nums">{f.value}</span>
                      {f.needsReview && <span className="mt-1 block text-xs font-medium text-orange-800">{t.needsReview}</span>}
                    </dd>
                  </div>
                ))}
              </dl>

              <h3 className="mt-6 text-sm font-semibold">{t.behind}</h3>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                {reportable.concat(draft.transactions.filter((x) => !x.reportable && x.confidence === "low")).map((x) => (
                  <li key={x.id} className="rounded-lg px-3 py-2 ring-1 ring-neutral-100">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span>
                        <span className="text-neutral-400">{x.date}</span> {x.description}
                      </span>
                      <span className="font-mono tabular-nums">{x.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
                    </div>
                    <div className="mt-1 leading-relaxed text-neutral-600">
                      <span className={`mr-2 rounded-md px-1.5 py-0.5 text-xs font-medium ${x.confidence === "low" ? "bg-orange-100 text-orange-800" : "bg-neutral-100 text-neutral-700"}`}>
                        {CATEGORY_LABEL[x.category][lang]}
                        {x.confidence === "low" ? ` · ${t.unsure}` : ""}
                      </span>
                      {x.reason}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4 rounded-xl border border-neutral-200 p-5">
              <h2 className="font-semibold">
                {t.step3}{" "}
                <span className="font-normal text-neutral-400" data-testid="progress">
                  · {t.of(doneCount, draft.checklist.length)}
                </span>
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-neutral-500">{t.step3Sub}</p>
              <ul className="mt-4 flex flex-col gap-2">
                {draft.checklist.map((c) => (
                  <li key={c.id}>
                    <label className={`flex cursor-pointer items-start gap-3 rounded-lg px-4 py-3 ring-1 ${checked[c.id] ? "bg-green-50/50 ring-green-200" : "ring-neutral-200"}`}>
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-green-600"
                        checked={Boolean(checked[c.id])}
                        onChange={(e) => setChecked((p) => ({ ...p, [c.id]: e.target.checked }))}
                      />
                      <span>
                        <span className="block font-medium">{c.text}</span>
                        <span className="block text-sm leading-relaxed text-neutral-500">{c.detail}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <button
                disabled={!allDone}
                className="mt-5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500"
              >
                {allDone ? t.ready : t.left(draft.checklist.length - doneCount)}
              </button>
            </section>
          </>
        )}

        <p className="mt-10 pb-6 text-xs leading-relaxed text-neutral-400">{t.disclaimer}</p>
      </div>
    </Shell>
  );
}
