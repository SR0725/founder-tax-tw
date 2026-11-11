"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { companies, obligationsFor } from "@/lib/obligations";
import { formatDate, useLang } from "@/lib/i18n";
import { Badge, Shell } from "@/components/Shell";

type Saved = { flagged: number; done: number; total: number; source: "claude" | "rules" };

const T = {
  en: {
    title: "Review queue",
    intro:
      "This is the reviewer's desk. The reviewer is not a CPA. Claude prepares each filing and writes the checklist; the reviewer clears it; a licensed CPA signs last.",
    steps: [
      ["Founder", "Uploads statements and answers a few yes/no questions."],
      ["Claude", "Classifies every transaction, drafts the form, flags what it is unsure about."],
      ["Reviewer", "Works through a plain-language checklist. No licence needed."],
      ["CPA", "Reviews the cleared draft and signs. Minutes, not hours."],
    ],
    cols: ["Filing", "Company", "Due", "Checklist", "Status"],
    notDrafted: "Not drafted yet",
    waitingDocs: "Waiting for documents",
    inReview: "In review",
    ready: "Ready for CPA",
    decisions: (n: number) => `${n} decisions flagged`,
    open: "Open",
    personal: "Personal",
  },
  zh: {
    title: "待審核",
    intro:
      "這裡是審核員的工作台。審核員不是會計師：Claude 準備每一份申報並寫好檢查清單，審核員逐項確認，最後才由有執照的美國會計師簽名。",
    steps: [
      ["創辦人", "上傳對帳單，回答幾個是非題。"],
      ["Claude", "分類每一筆交易、填好草稿、標出沒把握的地方。"],
      ["審核員", "照白話清單逐項確認，不需要執照。"],
      ["會計師", "審閱已確認的草稿並簽名，幾分鐘而不是幾小時。"],
    ],
    cols: ["申報項目", "公司", "期限", "清單進度", "狀態"],
    notDrafted: "尚未產生草稿",
    waitingDocs: "等待文件",
    inReview: "審核中",
    ready: "可送會計師",
    decisions: (n: number) => `標出 ${n} 項要判斷`,
    open: "開啟",
    personal: "個人",
  },
};

const GRID = "md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_150px_150px_150px] md:items-center md:gap-4";

export default function Review() {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const [saved, setSaved] = useState<Saved | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("draft-5472");
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {}
  }, []);

  const all = obligationsFor(2027).filter((o) => o.jurisdiction !== "taiwan");
  const name = (id: string) => (id === "personal" ? t.personal : companies.find((c) => c.id === id)?.name ?? id);
  const inQueue = saved ? 1 : 0;

  return (
    <Shell lang={lang} onLang={setLang} title={t.title} active="review" badge={inQueue}>
      <p className="max-w-3xl text-[15px] leading-relaxed text-neutral-600">{t.intro}</p>

      <ol className="mt-5 grid divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-neutral-50 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {t.steps.map(([who, what], i) => (
          <li key={who} className="p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-neutral-900 text-[11px] text-white">{i + 1}</span>
              {who}
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">{what}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200">
        <div className={`hidden border-b border-neutral-200 px-5 py-3 text-sm font-medium ${GRID}`}>
          {t.cols.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <ul className="divide-y divide-neutral-200">
          {all.map((o) => {
            const mine = o.id === "5472";
            const done = mine && saved && saved.done === saved.total;
            return (
              <li key={o.id} className={`flex flex-col gap-1.5 px-5 py-3.5 text-sm ${GRID}`}>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{o.title[lang]}</span>
                  <span className="block truncate text-[13px] text-neutral-500">{o.form}</span>
                </span>
                <span className="truncate text-neutral-600">{name(o.companyId)}</span>
                <span className="tabular-nums text-neutral-600">{formatDate(o.due, lang).full}</span>
                <span className="tabular-nums text-neutral-600" data-testid={mine ? "review-progress" : undefined}>
                  {mine && saved ? (
                    <>
                      {saved.done} / {saved.total}
                      <span className="block text-[13px] text-neutral-400">{t.decisions(saved.flagged)}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </span>
                <span>
                  {mine ? (
                    <Link href="/draft" className="inline-flex items-center gap-2">
                      <Badge tone={done ? "green" : saved ? "blue" : "orange"}>
                        {done ? t.ready : saved ? t.inReview : t.notDrafted}
                      </Badge>
                      <span className="text-[13px] text-blue-600 underline-offset-2 hover:underline">{t.open}</span>
                    </Link>
                  ) : (
                    <Badge tone="neutral">{t.waitingDocs}</Badge>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Shell>
  );
}
