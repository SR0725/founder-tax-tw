"use client";

import Link from "next/link";
import { JURISDICTION_LABEL, companies, obligationsFor } from "@/lib/obligations";
import { formatDate, useLang } from "@/lib/i18n";
import { Badge, Shell } from "@/components/Shell";

const T = {
  en: {
    title: "Filings",
    intro: "Every filing for tax year 2026, grouped by who owes it.",
    personal: "You, personally (Taiwan)",
    cols: ["Filing", "Jurisdiction", "Due", "Fee", "Stage"],
    drafting: "Draft ready",
    answer: "Needs your answer",
    todo: "Not started",
    open: "Open draft",
    none: "None",
  },
  zh: {
    title: "申報項目",
    intro: "2026 稅務年度的每一項申報，依申報義務人分組。",
    personal: "你個人（台灣）",
    cols: ["申報項目", "轄區", "期限", "規費", "進度"],
    drafting: "草稿可產生",
    answer: "等你回答",
    todo: "尚未開始",
    open: "開啟草稿",
    none: "無",
  },
};

const GRID = "md:grid md:grid-cols-[minmax(0,1.6fr)_120px_150px_80px_150px] md:items-center md:gap-4";

export default function Filings() {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const all = obligationsFor(2027);
  const groups = [
    ...companies.map((c) => ({ id: c.id, name: c.name, sub: `${c.state} LLC` })),
    { id: "personal", name: t.personal, sub: "" },
  ];

  return (
    <Shell lang={lang} onLang={setLang} title={t.title} active="filings" badge={all.length}>
      <p className="text-[15px] text-neutral-600">{t.intro}</p>
      {groups.map((g) => {
        const rows = all.filter((o) => o.companyId === g.id);
        return (
          <section key={g.id} className="mt-6">
            <h2 className="text-sm font-medium">
              {g.name} <span className="font-normal text-neutral-400">{g.sub && `· ${g.sub}`} · {rows.length}</span>
            </h2>
            <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200">
              <div className={`hidden border-b border-neutral-200 px-5 py-3 text-sm font-medium ${GRID}`}>
                {t.cols.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <ul className="divide-y divide-neutral-200">
                {rows.map((o) => (
                  <li key={o.id} className={`flex flex-col gap-1.5 px-5 py-3.5 text-sm ${GRID}`}>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{o.title[lang]}</span>
                      <span className="block truncate text-[13px] text-neutral-500">{o.form}</span>
                    </span>
                    <span className="text-neutral-600">{JURISDICTION_LABEL[o.jurisdiction][lang]}</span>
                    <span className="tabular-nums text-neutral-600">{formatDate(o.due, lang).full}</span>
                    <span className="tabular-nums text-neutral-600">{o.fee ?? t.none}</span>
                    <span>
                      {o.id === "5472" ? (
                        <Link href="/draft" className="inline-flex items-center gap-2">
                          <Badge tone="green">{t.drafting}</Badge>
                          <span className="text-[13px] text-blue-600 underline-offset-2 hover:underline">{t.open}</span>
                        </Link>
                      ) : o.question ? (
                        <Badge tone="orange">{t.answer}</Badge>
                      ) : (
                        <Badge tone="neutral">{t.todo}</Badge>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </Shell>
  );
}
