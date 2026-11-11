"use client";

import { JURISDICTION_LABEL, companies, obligationsFor } from "@/lib/obligations";
import { formatDate, useLang } from "@/lib/i18n";
import { Badge, Shell } from "@/components/Shell";

const T = {
  en: {
    title: "Companies",
    intro: "Your US companies and how the IRS sees each one. The tax class decides which filings you owe.",
    state: "State",
    formed: "Formed",
    members: "Members",
    taxClass: "US tax class",
    partnership: "Partnership",
    disregarded: "Disregarded entity (foreign-owned)",
    filings: "Filings each year",
    resident: "tax resident of",
  },
  zh: {
    title: "公司",
    intro: "你的美國公司，以及美國國稅局怎麼看待每一家。稅務分類決定你要報哪些表。",
    state: "成立州別",
    formed: "成立日期",
    members: "成員",
    taxClass: "美國稅務分類",
    partnership: "合夥",
    disregarded: "稅務上不視為獨立個體（外資獨資）",
    filings: "每年要申報的項目",
    resident: "稅務居民：",
  },
};

export default function Companies() {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const all = obligationsFor(2027);

  return (
    <Shell lang={lang} onLang={setLang} title={t.title} active="companies" badge={companies.length}>
      <p className="text-[15px] text-neutral-600">{t.intro}</p>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {companies.map((c) => {
          const owed = all.filter((o) => o.companyId === c.id);
          return (
            <section key={c.id} className="overflow-hidden rounded-xl border border-neutral-200">
              <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-4">
                <h2 className="font-semibold">{c.name}</h2>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{c.explain[lang]}</p>
              </div>
              <dl className="divide-y divide-neutral-100 px-5 text-sm">
                {[
                  [t.state, c.state],
                  [t.formed, formatDate(c.formed, lang).full],
                  [t.taxClass, c.taxClass === "partnership" ? t.partnership : t.disregarded],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-neutral-500">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="text-neutral-500">{t.members}</dt>
                  <dd className="text-right">
                    {c.members.map((m) => (
                      <span key={m.name} className="block">
                        <span className="font-medium">
                          {m.name} · {m.share}%
                        </span>{" "}
                        <span className="text-neutral-400">
                          {t.resident}
                          {lang === "zh" ? "台灣" : ` ${m.taxResident}`}
                        </span>
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
              <div className="border-t border-neutral-200 px-5 py-4">
                <div className="text-sm text-neutral-500">
                  {t.filings} · {owed.length}
                </div>
                <ul className="mt-2 flex flex-col gap-2 text-sm">
                  {owed.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate">{o.form}</span>
                      <Badge tone={o.maxPenalty >= 25000 ? "red" : "neutral"}>{JURISDICTION_LABEL[o.jurisdiction][lang]}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}
