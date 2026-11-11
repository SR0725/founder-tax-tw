"use client";

import Link from "next/link";
import { companies, obligationsFor } from "@/lib/obligations";
import { useLang } from "@/lib/i18n";
import { Badge, Shell } from "@/components/Shell";

const T = {
  en: {
    title: "Documents",
    intro: "Everything we need from you, and which filing each item unlocks. Upload once; we reuse it across filings.",
    cols: ["Document", "Needed for", "Status"],
    personal: "Personal",
    sample: "Sample on file",
    missing: "Missing",
    use: "Draft with it",
    count: (n: number, m: number) => `${n} documents across ${m} filings`,
  },
  zh: {
    title: "文件",
    intro: "我們需要你提供的所有資料，以及每一項用在哪一張申報。上傳一次，各項申報共用。",
    cols: ["文件", "用於", "狀態"],
    personal: "個人",
    sample: "已有範例檔",
    missing: "尚未提供",
    use: "用它產生草稿",
    count: (n: number, m: number) => `共 ${n} 份文件，用於 ${m} 項申報`,
  },
};

const GRID = "md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_190px] md:items-center md:gap-4";

export default function Documents() {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const all = obligationsFor(2027);
  const docs = all.flatMap((o) => o.need.map((n) => ({ key: `${o.id}-${n.en}`, name: n[lang], filing: o })));
  const name = (id: string) => (id === "personal" ? t.personal : companies.find((c) => c.id === id)?.name ?? id);

  return (
    <Shell lang={lang} onLang={setLang} title={t.title} active="documents">
      <p className="text-[15px] text-neutral-600">{t.intro}</p>
      <p className="mt-1 text-sm text-neutral-400">{t.count(docs.length, all.length)}</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200">
        <div className={`hidden border-b border-neutral-200 px-5 py-3 text-sm font-medium ${GRID}`}>
          {t.cols.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <ul className="divide-y divide-neutral-200">
          {docs.map((d) => {
            const hasSample = d.filing.id === "5472" && d.key.includes("Every transfer");
            return (
              <li key={d.key} className={`flex flex-col gap-1.5 px-5 py-3 text-sm ${GRID}`}>
                <span className="font-medium">{d.name}</span>
                <span className="min-w-0 text-neutral-600">
                  <span className="block truncate">{d.filing.form}</span>
                  <span className="block truncate text-[13px] text-neutral-400">{name(d.filing.companyId)}</span>
                </span>
                <span>
                  {hasSample ? (
                    <Link href="/draft" className="inline-flex items-center gap-2">
                      <Badge tone="green">{t.sample}</Badge>
                      <span className="text-[13px] text-blue-600 underline-offset-2 hover:underline">{t.use}</span>
                    </Link>
                  ) : (
                    <Badge tone="neutral">{t.missing}</Badge>
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
