"use client";

import { obligationsFor } from "@/lib/obligations";
import { formatDate, useLang } from "@/lib/i18n";
import { Badge, Shell } from "@/components/Shell";

const T = {
  en: {
    title: "Taiwan side",
    intro:
      "US filing services stop at the US border. You live in Taiwan, so your US companies also change what you owe at home. This is the part nobody tells you about.",
    due: "Your next Taiwan deadline",
    unverified: "Draft rules, not yet verified",
    topics: [
      {
        h: "Overseas income",
        p: "Money you actually receive from a US company (distributions, draws) is overseas income. Once your overseas income for the year reaches NT$1,000,000, it counts toward your basic income under the alternative minimum tax.",
        q: "What we check: every distribution and owner draw we classified in your US filings is carried here automatically.",
      },
      {
        h: "Controlled foreign company (CFC) rules",
        p: "Since 2023 Taiwan can tax an individual on the profit of a foreign company they control, even if the money never left the company. Whether a US LLC falls under these rules depends on how it is taxed in the US.",
        q: "What we check: your ownership percentage and each company's year-end profit. A Taiwan CPA must confirm how this applies to your LLC.",
      },
      {
        h: "Why this belongs in the same product",
        p: "The numbers on your Taiwan return come from the same bank statements as your US filings. Classify a transaction once and both sides stay consistent.",
        q: "What we hand over: a one-page summary for your Taiwan CPA, in Chinese, with the figures already tied to your US forms.",
      },
    ],
    cta: "Confirm with a licensed Taiwan CPA before filing. This page is not tax advice.",
  },
  zh: {
    title: "台灣這一側",
    intro: "美國的報稅服務只管到美國國界為止。但你住在台灣，美國公司也會改變你在台灣要繳的稅。這是沒有人會告訴你的那一塊。",
    due: "你在台灣的下一個期限",
    unverified: "規則草稿，尚未查證",
    topics: [
      {
        h: "海外所得",
        p: "你實際從美國公司領到的錢（盈餘分配、老闆提領）屬於海外所得。全年海外所得達新台幣 100 萬元，就要計入基本所得額，適用最低稅負制。",
        q: "我們檢查什麼：美國申報裡被分類成分配或提領的每一筆，都會自動帶到這裡。",
      },
      {
        h: "受控外國企業（CFC）制度",
        p: "2023 年起，個人對自己控制的境外公司，就算盈餘沒有匯回來，台灣也可能課稅。美國 LLC 算不算在內，取決於它在美國怎麼被課稅。",
        q: "我們檢查什麼：你的持股比例和每家公司的年底盈餘。這一項一定要請台灣會計師確認怎麼適用在你的 LLC 上。",
      },
      {
        h: "為什麼要放在同一個產品裡",
        p: "台灣報稅要用的數字，和美國申報來自同一份銀行對帳單。一筆交易只要分類一次，兩邊就不會兜不起來。",
        q: "我們交付什麼：一頁給台灣會計師的中文摘要，數字已經和美國那邊的表對好。",
      },
    ],
    cta: "申報前請找有執照的台灣會計師確認。本頁不是稅務建議。",
  },
};

export default function Taiwan() {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const tw = obligationsFor(2027).find((o) => o.jurisdiction === "taiwan")!;

  return (
    <Shell lang={lang} onLang={setLang} title={t.title} active="taiwan">
      <p className="max-w-3xl text-[15px] leading-relaxed text-neutral-600">{t.intro}</p>

      <section className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="text-sm text-neutral-500">{t.due}</div>
          <Badge tone="neutral">{t.unverified}</Badge>
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{formatDate(tw.due, lang).full}</div>
        <div className="mt-1 text-sm text-neutral-600">
          {tw.form} · {tw.title[lang]}
        </div>
      </section>

      <div className="mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
        {t.topics.map((x) => (
          <section key={x.h} className="grid gap-3 p-5 md:grid-cols-[220px_1fr]">
            <h2 className="font-medium">{x.h}</h2>
            <div className="text-sm leading-relaxed">
              <p className="text-neutral-700">{x.p}</p>
              <p className="mt-2 text-neutral-500">{x.q}</p>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 pb-4 text-xs leading-relaxed text-neutral-400">{t.cta}</p>
    </Shell>
  );
}
