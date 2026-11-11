"use client";

import { useEffect, useMemo, useState } from "react";
import {
  JURISDICTION_LABEL,
  companies,
  daysUntil,
  founder,
  obligationsFor,
  type Obligation,
} from "@/lib/obligations";
import { formatDate, twd, useLang, type Lang } from "@/lib/i18n";
import { Badge, Shell } from "@/components/Shell";

const YEAR = 2027;

const T = {
  en: {
    nav: ["Today", "Filings", "Documents", "Review queue", "Companies"],
    greet: (h: number) => (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"),
    headline: (n: number, c: number) => `Your ${c} US companies owe ${n} filings in ${YEAR}.`,
    sub: "Nobody sent you this list when you incorporated. Here it is, in order.",
    next: "Next deadline",
    days: (n: number) => `${n} days`,
    exposure: "Known penalty exposure",
    exposureSub: "if every filing is missed",
    waiting: "Waiting on you",
    questions: (n: number) => `${n} questions`,
    waitingSub: "to confirm what applies",
    needsYou: "Needs you",
    all: "All",
    taiwanSide: "Taiwan side",
    personal: "You, personally",
    ifMissed: "If missed",
    mayApply: "May apply",
    yes: "Yes",
    no: "No",
    why: "Why you owe this",
    need: "What we need from you",
    due: "Due",
    fee: "Fee",
    source: "Official source",
    unverified: "Draft rule, not yet verified",
    draft: "Draft this filing",
    cleared: "Cleared",
    clearedNote: "does not apply based on your answer",
    undo: "Undo",
    nothing: "Nothing owed here.",
    whyDifferent: "Why your two companies owe different things",
    disclaimer:
      "Not tax advice. Rules shown are drafts pending verification and every filing is reviewed by a licensed professional before it is submitted. Demo data is synthetic.",
    approx: "approx.",
    page: "Today",
    cols: ["Due", "Filing", "Company", "If missed", "Status"],
    dueIn: (n: number) => `In ${n} days`,
    draft5472: "Draft Form 5472",
    timeline: `${YEAR} deadlines`,
  },
  zh: {
    nav: ["今天", "申報項目", "文件", "待審核", "公司"],
    greet: (h: number) => (h < 12 ? "早安" : h < 18 ? "午安" : "晚安"),
    headline: (n: number, c: number) => `你的 ${c} 家美國公司，${YEAR} 年有 ${n} 項要申報。`,
    sub: "開公司的時候沒有人給你這張清單。現在照到期順序排給你。",
    next: "最近的期限",
    days: (n: number) => `${n} 天`,
    exposure: "已知罰則風險",
    exposureSub: "如果全部都沒報",
    waiting: "等你回答",
    questions: (n: number) => `${n} 個問題`,
    waitingSub: "確認哪些項目適用",
    needsYou: "需要你處理",
    all: "全部",
    taiwanSide: "台灣這一側",
    personal: "你個人",
    ifMissed: "沒報的後果",
    mayApply: "可能適用",
    yes: "有",
    no: "沒有",
    why: "為什麼要報",
    need: "需要你提供",
    due: "期限",
    fee: "規費",
    source: "官方來源",
    unverified: "規則草稿，尚未查證",
    draft: "產生申報草稿",
    cleared: "已排除",
    clearedNote: "依你的回答不適用",
    undo: "復原",
    nothing: "這裡沒有要申報的項目。",
    whyDifferent: "為什麼你的兩家公司要報的東西不一樣",
    disclaimer:
      "本服務不是稅務建議。畫面上的規則是待查證的草稿，每一份申報在送出前都會由有執照的專業人士審核。示範資料為虛構。",
    approx: "約",
    page: "今天",
    cols: ["期限", "申報項目", "對象", "沒報的後果", "狀態"],
    dueIn: (n: number) => `${n} 天後到期`,
    draft5472: "產生 Form 5472 草稿",
    timeline: `${YEAR} 年申報期限`,
  },
};

type Answer = "yes" | "no";

const GRID = "md:grid md:grid-cols-[92px_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.2fr)_124px] md:items-center md:gap-4";

const clock = (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 5v3l2 1.2" />
  </svg>
);

export default function Home() {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const [now, setNow] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  useEffect(() => setNow(new Date()), []);

  const all = useMemo(() => obligationsFor(YEAR), []);
  const cleared = all.filter((o) => answers[o.id] === "no");
  const active = all.filter((o) => answers[o.id] !== "no");
  const visible = active.filter((o) => filter === "all" || o.companyId === filter);

  const next = active[0];
  const exposure = active.reduce((sum, o) => sum + o.maxPenalty, 0);
  const openQuestions = active.filter((o) => o.question && !answers[o.id]).length;

  const companyName = (id: string) =>
    id === "personal" ? t.personal : companies.find((c) => c.id === id)?.name ?? id;

  const filters = [
    { id: "all", label: t.all },
    ...companies.map((c) => ({ id: c.id, label: c.name })),
    { id: "personal", label: t.taiwanSide },
  ];

  return (
    <Shell lang={lang} onLang={setLang} title={t.page} badge={active.length}>
      <p className="text-[15px] text-neutral-600" data-testid="headline">
        <span className="font-medium text-neutral-900">
          {t.greet(now ? now.getHours() : 20)}
          {lang === "zh" ? "，" : ", "}
          {founder.name}
          {lang === "zh" ? "。" : "."}
        </span>{" "}
        {t.headline(active.length, companies.length)} {t.sub}
      </p>

      <section className="mt-5 grid divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-neutral-50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <div className="text-sm text-neutral-500">{t.next}</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
            {now && next ? t.days(daysUntil(next.due, now)) : "—"}
          </div>
          <div className="mt-1 text-sm text-neutral-500">{next ? formatDate(next.due, lang).full : ""}</div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm text-neutral-500">{t.exposure}</div>
            <a
              href="/draft"
              className="-mt-1 whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1.5 text-[13px] font-medium text-white hover:bg-neutral-700"
            >
              {t.draft5472}
            </a>
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight" data-testid="exposure">
            ${exposure.toLocaleString("en-US")}.00 USD
          </div>
          <div className="mt-1 text-sm text-neutral-500">
            {lang === "zh" ? `${t.approx} ${twd(exposure)}，${t.exposureSub}` : t.exposureSub}
          </div>
        </div>
        <div className="p-5">
          <div className="text-sm text-neutral-500">{t.waiting}</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{t.questions(openQuestions)}</div>
          <div className="mt-1 text-sm text-neutral-500">{t.waitingSub}</div>
        </div>
      </section>

      <section className="mt-3 rounded-xl border border-neutral-200 px-5 pb-3 pt-4">
        <div className="text-sm text-neutral-500">{t.timeline}</div>
        <div className="relative mt-3 h-5">
          <div className="absolute inset-x-0 top-1/2 h-px bg-neutral-200" />
          {active.map((o) => {
            const d = new Date(`${o.due}T00:00:00`);
            const pos = ((d.getMonth() + (d.getDate() - 1) / 31) / 12) * 100;
            return (
              <button
                key={o.id}
                aria-label={`${o.form}, ${formatDate(o.due, lang).full}`}
                title={`${o.form} · ${formatDate(o.due, lang).full}`}
                onClick={() => setSelectedId(o.id)}
                style={{ left: `${pos}%` }}
                className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${
                  o.maxPenalty >= 25000 ? "bg-red-500" : selectedId === o.id ? "bg-blue-600" : "bg-neutral-800"
                }`}
              />
            );
          })}
        </div>
        <div className="mt-1 grid grid-cols-12 text-center text-[11px] text-neutral-400">
          {Array.from({ length: 12 }, (_, m) => (
            <span key={m}>
              {lang === "zh" ? `${m + 1}月` : new Date(YEAR, m, 1).toLocaleString("en-US", { month: "short" })}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`h-8 rounded-lg border px-3 text-sm font-medium ${
              filter === f.id
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <section className="mt-3 overflow-hidden rounded-xl border border-neutral-200">
        <div className={`hidden border-b border-neutral-200 px-5 py-3 text-sm font-medium ${GRID}`}>
          {t.cols.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <ul className="divide-y divide-neutral-200">
          {visible.map((o) => (
            <Row
              key={o.id}
              o={o}
              lang={lang}
              now={now}
              company={companyName(o.companyId)}
              open={selectedId === o.id}
              answer={answers[o.id]}
              onToggle={() => setSelectedId(selectedId === o.id ? null : o.id)}
              onAnswer={(a) => setAnswers((prev) => ({ ...prev, [o.id]: a }))}
            />
          ))}
          {visible.length === 0 && <li className="p-8 text-center text-sm text-neutral-500">{t.nothing}</li>}
        </ul>
      </section>

      {cleared.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-medium">
            {t.cleared} <span className="font-normal text-neutral-400">· {cleared.length}</span>
          </h2>
          <ul className="mt-2 divide-y divide-neutral-200 rounded-xl border border-neutral-200">
            {cleared.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm text-neutral-500">
                <span>
                  <span className="line-through">{o.form}</span> · {t.clearedNote}
                </span>
                <button
                  className="shrink-0 rounded-md border border-neutral-200 px-2 py-1 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50"
                  onClick={() =>
                    setAnswers((prev) => {
                      const copy = { ...prev };
                      delete copy[o.id];
                      return copy;
                    })
                  }
                >
                  {t.undo}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium">{t.whyDifferent}</h2>
        <div className="mt-2 grid divide-y divide-neutral-200 rounded-xl border border-neutral-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {companies.map((c) => (
            <div key={c.id} className="p-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Avatar name={c.name} />
                {c.name}
              </div>
              <div className="mt-1 text-[13px] text-neutral-500">
                {c.state} · {c.members.map((m) => `${m.name} ${m.share}%`).join(lang === "zh" ? "、" : ", ")}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{c.explain[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 pb-4 text-xs leading-relaxed text-neutral-400">{t.disclaimer}</p>
    </Shell>
  );
}

function Avatar({ name }: { name: string }) {
  const tones = ["bg-violet-100 text-violet-700", "bg-sky-100 text-sky-700", "bg-emerald-100 text-emerald-700"];
  const tone = tones[name.charCodeAt(0) % tones.length];
  return (
    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${tone}`}>
      {name.trim().charAt(0)}
    </span>
  );
}

function Row({
  o,
  lang,
  now,
  company,
  open,
  answer,
  onToggle,
  onAnswer,
}: {
  o: Obligation;
  lang: Lang;
  now: Date | null;
  company: string;
  open: boolean;
  answer?: Answer;
  onToggle: () => void;
  onAnswer: (a: Answer) => void;
}) {
  const t = T[lang];
  const due = formatDate(o.due, lang);
  const days = now ? daysUntil(o.due, now) : null;
  const pending = Boolean(o.question) && !answer;
  const severe = o.maxPenalty >= 25000;

  return (
    <li className={open ? "bg-neutral-50/60" : ""}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full flex-col gap-1.5 px-5 py-3.5 text-left text-sm hover:bg-neutral-50 ${GRID}`}
      >
        <span className="tabular-nums text-neutral-600">
          {lang === "zh" ? `${due.month.replace(" ", "")}${due.day}日` : `${due.month} ${due.day}`}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium">{o.title[lang]}</span>
          <span className="block truncate text-[13px] text-neutral-500">
            {o.form} · {JURISDICTION_LABEL[o.jurisdiction][lang]}
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-2 text-neutral-700">
          <Avatar name={company} />
          <span className="truncate">{company}</span>
        </span>
        <span className={`min-w-0 ${severe ? "font-medium text-red-600" : "text-neutral-500"}`}>
          {o.penalty[lang]}
          {severe && lang === "zh" ? `（${t.approx} ${twd(o.maxPenalty)}）` : ""}
        </span>
        <span>
          {pending ? (
            <Badge tone="orange">
              {clock}
              {t.mayApply}
            </Badge>
          ) : (
            <Badge tone={severe ? "red" : "neutral"}>{days === null ? "—" : t.dueIn(days)}</Badge>
          )}
        </span>
      </button>

      {pending && (
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 bg-orange-50/50 px-5 py-2.5 text-sm">
          <span className="mr-auto text-neutral-700">{o.question![lang]}</span>
          <button onClick={() => onAnswer("yes")} className="h-8 rounded-lg bg-neutral-900 px-3 font-medium text-white hover:bg-neutral-700">
            {t.yes}
          </button>
          <button onClick={() => onAnswer("no")} className="h-8 rounded-lg border border-neutral-200 bg-white px-3 font-medium hover:bg-neutral-50">
            {t.no}
          </button>
        </div>
      )}

      {open && (
        <div className="grid gap-5 border-t border-neutral-100 px-5 py-4 text-sm leading-relaxed sm:grid-cols-2">
          <div>
            <h3 className="font-medium">{t.why}</h3>
            <p className="mt-1 text-neutral-600">{o.why[lang]}</p>
          </div>
          <div>
            <h3 className="font-medium">{t.need}</h3>
            <ul className="mt-1 list-disc pl-5 text-neutral-600">
              {o.need.map((n) => (
                <li key={n.en}>{n[lang]}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-neutral-500 sm:col-span-2">
            {o.id === "5472" && (
              <a href="/draft" className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700">
                {t.draft}
              </a>
            )}
            <span>
              {t.due} {due.full}
            </span>
            {o.fee && (
              <span>
                {t.fee} {o.fee}
              </span>
            )}
            <a href={o.source} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              {t.source}
            </a>
            {!o.verified && <Badge tone="neutral">{t.unverified}</Badge>}
          </div>
        </div>
      )}
    </li>
  );
}
