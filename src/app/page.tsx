"use client";

import { useEffect, useMemo, useState } from "react";
import {
  JURISDICTION_LABEL,
  companies,
  daysUntil,
  founder,
  obligationsFor,
  type Jurisdiction,
  type Obligation,
} from "@/lib/obligations";
import { formatDate, twd, useLang, type Lang } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";

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
  },
};

const TONE: Record<Jurisdiction, { dot: string; chip: string; bar: string }> = {
  federal: { dot: "bg-indigo-500", chip: "bg-indigo-50 text-indigo-700", bar: "bg-indigo-500" },
  delaware: { dot: "bg-sky-500", chip: "bg-sky-50 text-sky-700", bar: "bg-sky-500" },
  wyoming: { dot: "bg-amber-500", chip: "bg-amber-50 text-amber-800", bar: "bg-amber-500" },
  taiwan: { dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500" },
};

type Answer = "yes" | "no";

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

  const todayPos = now && now.getFullYear() === YEAR ? ((now.getMonth() + now.getDate() / 31) / 12) * 100 : null;

  return (
    <div className="flex min-h-screen bg-[#f7f6f3] text-stone-900">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-200/80 bg-[#fbfaf8] px-4 py-5 md:flex">
        <div className="flex items-center gap-2.5 px-2 text-[15px] font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-stone-900 text-[11px] font-bold text-white">FT</span>
          Founder Tax
        </div>
        <nav className="mt-6 flex flex-col gap-0.5 text-sm">
          {t.nav.map((item, i) => (
            <span
              key={item}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                i === 0 ? "bg-white font-medium shadow-sm ring-1 ring-stone-200" : "text-stone-500"
              }`}
            >
              {item}
              {i === 0 && (
                <span className="rounded-full bg-stone-900 px-1.5 text-[11px] leading-5 text-white">{active.length}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2.5 px-2 text-sm">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-xs font-semibold text-white">R</span>
          <span>
            <span className="block font-medium leading-tight">{founder.name}</span>
            <span className="block text-xs text-stone-500">{founder.residence[lang]}</span>
          </span>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t.greet(now ? now.getHours() : 20)}
              {lang === "zh" ? "，" : ", "}
              {founder.name}
            </h1>
            <LangToggle lang={lang} onChange={setLang} />
          </div>

          <section className="mt-5 overflow-hidden rounded-3xl bg-stone-900 text-white shadow-lg shadow-stone-900/10">
            <div className="p-6 md:p-8">
              <p className="text-xl font-semibold leading-snug tracking-tight md:text-2xl" data-testid="headline">
                {t.headline(active.length, companies.length)}
              </p>
              <p className="mt-2 text-stone-400">{t.sub}</p>

              <dl className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{t.next}</dt>
                  <dd className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight">
                    {now && next ? t.days(daysUntil(next.due, now)) : "—"}
                  </dd>
                  <dd className="mt-0.5 text-sm text-stone-400">{next ? formatDate(next.due, lang).full : ""}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{t.exposure}</dt>
                  <dd className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-rose-400" data-testid="exposure">
                    ${exposure.toLocaleString("en-US")}+
                  </dd>
                  <dd className="mt-0.5 text-sm text-stone-400">
                    {lang === "zh" ? `${t.approx} ${twd(exposure)}，${t.exposureSub}` : t.exposureSub}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{t.waiting}</dt>
                  <dd className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight">{t.questions(openQuestions)}</dd>
                  <dd className="mt-0.5 text-sm text-stone-400">{t.waitingSub}</dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-white/10 bg-white/[0.03] px-6 pb-4 pt-5 md:px-8">
              <div className="relative h-6">
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
                {todayPos !== null && (
                  <div className="absolute top-0 h-6 w-px bg-white/60" style={{ left: `${todayPos}%` }} />
                )}
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
                      className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-stone-900 transition-transform hover:scale-125 ${
                        o.maxPenalty >= 25000 ? "bg-rose-400" : TONE[o.jurisdiction].dot
                      } ${selectedId === o.id ? "scale-125 ring-white" : ""}`}
                    />
                  );
                })}
              </div>
              <div className="mt-1 grid grid-cols-12 text-center text-[11px] text-stone-500">
                {Array.from({ length: 12 }, (_, m) => (
                  <span key={m}>
                    {lang === "zh" ? `${m + 1}月` : new Date(YEAR, m, 1).toLocaleString("en-US", { month: "short" })}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              {t.needsYou} <span className="font-normal text-stone-400">· {visible.length}</span>
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full px-3 py-1 text-sm transition-colors ${
                    filter === f.id
                      ? "bg-stone-900 text-white"
                      : "bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-stone-400"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-3 flex flex-col gap-2.5">
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
            {visible.length === 0 && (
              <li className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500">{t.nothing}</li>
            )}
          </ul>

          {cleared.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold tracking-tight">
                {t.cleared} <span className="font-normal text-stone-400">· {cleared.length}</span>
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {cleared.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3 text-sm text-stone-500 ring-1 ring-stone-200"
                  >
                    <span>
                      <span className="line-through">{o.form}</span> · {t.clearedNote}
                    </span>
                    <button
                      className="shrink-0 underline"
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

          <section className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight">{t.whyDifferent}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {companies.map((c) => (
                <div key={c.id} className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
                  <div className="font-medium">{c.name}</div>
                  <div className="mt-0.5 text-sm text-stone-500">
                    {c.state} · {c.members.map((m) => `${m.name} ${m.share}%`).join(lang === "zh" ? "、" : ", ")}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700">{c.explain[lang]}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-10 pb-6 text-xs leading-relaxed text-stone-400">{t.disclaimer}</p>
        </div>
      </main>
    </div>
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
  const tone = TONE[o.jurisdiction];

  return (
    <li className={`relative overflow-hidden rounded-2xl bg-white ring-1 transition-shadow hover:shadow-md ${severe ? "ring-rose-200" : "ring-stone-200"}`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${severe ? "bg-rose-500" : tone.bar}`} />
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 py-4 pl-6 pr-5 text-left">
        <span className="w-12 shrink-0 text-center">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-stone-400">{due.month}</span>
          <span className="block text-2xl font-semibold leading-tight tabular-nums">{due.day}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{o.title[lang]}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-stone-500">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone.chip}`}>
              {JURISDICTION_LABEL[o.jurisdiction][lang]}
            </span>
            <span>{o.form}</span>
            <span className="text-stone-300">·</span>
            <span>{company}</span>
          </span>
          <span className={`mt-1.5 block text-sm ${severe ? "font-semibold text-rose-600" : "text-stone-600"}`}>
            {t.ifMissed}
            {lang === "zh" ? "：" : ": "}
            {o.penalty[lang]}
            {severe && lang === "zh" ? `（${t.approx} ${twd(o.maxPenalty)}）` : ""}
          </span>
        </span>
        <span className="shrink-0 text-right text-sm">
          {pending ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">{t.mayApply}</span>
          ) : (
            <span className="tabular-nums text-stone-500">{days === null ? "" : t.days(days)}</span>
          )}
        </span>
      </button>

      {pending && (
        <div className="flex flex-wrap items-center gap-2 border-t border-amber-100 bg-amber-50/70 py-3 pl-6 pr-5 text-sm">
          <span className="mr-auto">{o.question![lang]}</span>
          <button onClick={() => onAnswer("yes")} className="rounded-lg bg-stone-900 px-3.5 py-1.5 font-medium text-white">
            {t.yes}
          </button>
          <button onClick={() => onAnswer("no")} className="rounded-lg bg-white px-3.5 py-1.5 font-medium ring-1 ring-stone-300">
            {t.no}
          </button>
        </div>
      )}

      {open && (
        <div className="border-t border-stone-100 py-4 pl-6 pr-5 text-sm leading-relaxed">
          <h3 className="font-semibold">{t.why}</h3>
          <p className="mt-1 text-stone-700">{o.why[lang]}</p>
          <h3 className="mt-4 font-semibold">{t.need}</h3>
          <ul className="mt-1 list-disc pl-5 text-stone-700">
            {o.need.map((n) => (
              <li key={n.en}>{n[lang]}</li>
            ))}
          </ul>
          {o.id === "5472" && (
            <a href="/draft" className="mt-4 inline-block rounded-lg bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-700">
              {t.draft} →
            </a>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-500">
            <span>
              {t.due} {due.full}
            </span>
            {o.fee && (
              <span>
                {t.fee} {o.fee}
              </span>
            )}
            <a href={o.source} target="_blank" rel="noreferrer" className="underline">
              {t.source}
            </a>
            {!o.verified && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">{t.unverified}</span>}
          </div>
        </div>
      )}
    </li>
  );
}
