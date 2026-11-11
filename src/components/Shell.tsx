"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { VoiceAssistant } from "@/components/VoiceAssistant";

const icon = (d: string) => (
  <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

const ICONS = {
  today: icon("M2.5 6.5h11M5 2v2M11 2v2M3.5 3.5h9a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z"),
  filings: icon("M4 2h5.5L12 4.5V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1ZM9 2v3h3M5.5 8h5M5.5 10.5h5"),
  documents: icon("M2 4.5a1 1 0 0 1 1-1h3l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.5Z"),
  review: icon("M3 3h10v10H3zM5.5 8l1.8 1.8L10.5 6.2"),
  companies: icon("M3 14V3.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1V14M10 7h2.5a.5.5 0 0 1 .5.5V14M2 14h12M5.5 5.5h2M5.5 8h2M5.5 10.5h2"),
  taiwan: icon("M8 14s4.5-3.6 4.5-7.3A4.5 4.5 0 0 0 3.5 6.700C3.5 10.4 8 14 8 14ZM8 8.3a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z"),
};

const NAV = {
  en: {
    product: "GoTax",
    groups: [
      { label: "", items: [["today", "Today"], ["filings", "Filings"], ["documents", "Documents"]] },
      { label: "Review", items: [["review", "Review queue"]] },
      { label: "Setup", items: [["companies", "Companies"], ["taiwan", "Taiwan side"]] },
    ],
  },
  zh: {
    product: "GoTax",
    groups: [
      { label: "", items: [["today", "今天"], ["filings", "申報項目"], ["documents", "文件"]] },
      { label: "審核", items: [["review", "待審核"]] },
      { label: "設定", items: [["companies", "公司"], ["taiwan", "台灣這一側"]] },
    ],
  },
} as const;

export function Shell({
  lang,
  onLang,
  title,
  badge,
  active = "today",
  children,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  title: ReactNode;
  badge?: number;
  active?: string;
  children: ReactNode;
}) {
  const nav = NAV[lang];
  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-900 md:gap-2 md:p-2">
      <aside className="hidden w-60 shrink-0 flex-col rounded-xl bg-neutral-50 px-3 py-4 md:flex">
        <Link href="/" className="flex items-center gap-2 px-2 text-[15px] font-semibold tracking-tight">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-neutral-900 text-[10px] font-bold text-white">GT</span>
          {nav.product}
        </Link>
        <nav className="mt-5 flex flex-col gap-5 text-sm">
          {nav.groups.map((g) => (
            <div key={g.label || "main"} className="flex flex-col gap-0.5">
              {g.label && <div className="px-2 pb-1 text-[13px] text-neutral-400">{g.label}</div>}
              {g.items.map(([id, label]) => {
                const on = id === active;
                return (
                  <Link
                    key={id}
                    href={id === "today" ? "/" : `/${id}`}
                    aria-current={on ? "page" : undefined}
                    className={`flex h-8 items-center gap-2.5 rounded-md px-2 ${
                      on ? "bg-blue-100/60 font-medium text-blue-600" : "text-neutral-600 hover:bg-neutral-200/50"
                    }`}
                  >
                    {ICONS[id as keyof typeof ICONS]}
                    <span className="flex-1">{label}</span>
                    {on && badge !== undefined && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-md bg-blue-600 px-1 text-xs font-medium text-white">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-2 text-sm">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700">R</span>
          <span className="leading-tight">
            <span className="block font-medium">Ray Lin</span>
            <span className="block text-xs text-neutral-500">{lang === "zh" ? "台灣台北" : "Taipei, Taiwan"}</span>
          </span>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-white md:rounded-xl md:border md:border-neutral-200">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-neutral-100 px-4 md:px-8">
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          <LangToggle lang={lang} onChange={onLang} />
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-neutral-100 px-3 py-2 text-sm md:hidden">
          {nav.groups.flatMap((g) => g.items.map((it) => [it[0], it[1]] as [string, string])).map(([id, label]) => (
            <Link
              key={id}
              href={id === "today" ? "/" : `/${id}`}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 ${
                id === active ? "bg-blue-100/60 font-medium text-blue-600" : "text-neutral-600"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">{children}</div>
      </main>
      <VoiceAssistant lang={lang} />
    </div>
  );
}

export function Badge({ tone, children }: { tone: "orange" | "green" | "red" | "neutral" | "blue"; children: ReactNode }) {
  const tones = {
    orange: "bg-orange-100 text-orange-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    neutral: "bg-neutral-100 text-neutral-600",
  };
  return (
    <span className={`inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-md px-1.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
