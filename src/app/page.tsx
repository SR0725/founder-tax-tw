"use client";

import { useEffect, useMemo, useState } from "react";
import {
  companies,
  daysUntil,
  formatDue,
  founder,
  obligationsFor,
  type Obligation,
} from "@/lib/obligations";

const YEAR = 2027;
const NAV = ["Today", "Filings", "Documents", "Review queue", "Companies"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Answer = "yes" | "no";

function companyName(id: string) {
  return id === "personal" ? "You, personally" : companies.find((c) => c.id === id)?.name ?? id;
}

function greeting(now: Date | null) {
  if (!now) return "Hello";
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  useEffect(() => setNow(new Date()), []);

  const all = useMemo(() => obligationsFor(YEAR), []);
  const cleared = all.filter((o) => answers[o.id] === "no");
  const active = all.filter((o) => answers[o.id] !== "no");
  const visible = active.filter((o) => filter === "all" || o.companyId === filter);
  const selected = all.find((o) => o.id === selectedId) ?? null;

  const next = active[0];
  const exposure = active.reduce((sum, o) => sum + o.maxPenalty, 0);
  const openQuestions = active.filter((o) => o.question && !answers[o.id]).length;

  const filters = [
    { id: "all", label: "All" },
    ...companies.map((c) => ({ id: c.id, label: c.name })),
    { id: "personal", label: "Taiwan side" },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-stone-200 px-4 py-5 md:flex">
        <div className="flex items-center gap-2 px-2 text-[15px] font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-stone-900 text-xs text-white">FT</span>
          Founder Tax
        </div>
        <nav className="mt-6 flex flex-col gap-0.5 text-sm">
          {NAV.map((item, i) => (
            <span
              key={item}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                i === 0 ? "bg-stone-200/70 font-medium" : "text-stone-500"
              }`}
            >
              {item}
              {i === 0 && (
                <span className="rounded-full bg-stone-900 px-1.5 text-[11px] leading-5 text-white">
                  {active.length}
                </span>
              )}
            </span>
          ))}
        </nav>
        <div className="mt-auto px-2 text-sm">
          <div className="font-medium">{founder.name}</div>
          <div className="text-stone-500">{founder.residence}</div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 md:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting(now)}, {founder.name}
          </h1>

          <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-lg font-medium leading-snug">
              Your {companies.length} US companies owe{" "}
              <span data-testid="count">{active.length}</span> filings in {YEAR}.
            </p>
            <p className="mt-1 text-stone-500">
              Nobody sent you this list when you incorporated. Here it is, in order.
            </p>
            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-400">Next deadline</dt>
                <dd className="mt-1 text-xl font-semibold">
                  {now && next ? `${daysUntil(next.due, now)} days` : "—"}
                </dd>
                <dd className="text-sm text-stone-500">{next ? formatDue(next.due).full : ""}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-400">Known penalty exposure</dt>
                <dd className="mt-1 text-xl font-semibold text-red-700" data-testid="exposure">
                  ${exposure.toLocaleString("en-US")}+
                </dd>
                <dd className="text-sm text-stone-500">if every filing is missed</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-400">Waiting on you</dt>
                <dd className="mt-1 text-xl font-semibold">{openQuestions} questions</dd>
                <dd className="text-sm text-stone-500">to confirm what applies</dd>
              </div>
            </dl>

            <div className="mt-6">
              <div className="relative h-8">
                <div className="absolute inset-x-0 top-1/2 h-px bg-stone-200" />
                {active.map((o) => {
                  const d = new Date(`${o.due}T00:00:00`);
                  const pos = ((d.getMonth() + (d.getDate() - 1) / 31) / 12) * 100;
                  return (
                    <button
                      key={o.id}
                      aria-label={`${o.form}, due ${formatDue(o.due).full}`}
                      title={`${o.form} · ${formatDue(o.due).full}`}
                      onClick={() => setSelectedId(o.id)}
                      style={{ left: `${pos}%` }}
                      className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${
                        o.maxPenalty >= 25000 ? "bg-red-600" : "bg-stone-900"
                      } ${selectedId === o.id ? "ring-2 ring-stone-400" : ""}`}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-12 text-center text-[11px] text-stone-400">
                {MONTHS.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Needs you <span className="font-normal text-stone-400">· {visible.length}</span>
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    filter === f.id
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-3 flex flex-col gap-2">
            {visible.map((o) => (
              <Row
                key={o.id}
                o={o}
                now={now}
                open={selectedId === o.id}
                answer={answers[o.id]}
                onToggle={() => setSelectedId(selectedId === o.id ? null : o.id)}
                onAnswer={(a) => setAnswers((prev) => ({ ...prev, [o.id]: a }))}
              />
            ))}
            {visible.length === 0 && (
              <li className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-500">
                Nothing owed here.
              </li>
            )}
          </ul>

          {cleared.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">
                Cleared <span className="font-normal text-stone-400">· {cleared.length}</span>
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {cleared.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm text-stone-500"
                  >
                    <span>
                      <span className="line-through">{o.form}</span> · does not apply based on your answer
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
                      Undo
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-lg font-semibold">Why your two companies owe different things</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {companies.map((c) => (
                <div key={c.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                  <div className="font-medium">{c.name}</div>
                  <div className="mt-0.5 text-sm text-stone-500">
                    {c.state} · {c.members.map((m) => `${m.name} ${m.share}%`).join(", ")}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700">{c.plainEnglish}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="mt-10 pb-6 text-xs text-stone-400">
            Not tax advice. Rules shown are drafts pending verification and every filing is reviewed by a
            licensed professional before it is submitted. Demo data is synthetic.
          </p>
        </div>
      </main>
    </div>
  );
}

function Row({
  o,
  now,
  open,
  answer,
  onToggle,
  onAnswer,
}: {
  o: Obligation;
  now: Date | null;
  open: boolean;
  answer?: Answer;
  onToggle: () => void;
  onAnswer: (a: Answer) => void;
}) {
  const due = formatDue(o.due);
  const days = now ? daysUntil(o.due, now) : null;
  const pending = Boolean(o.question) && !answer;

  return (
    <li className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <span className="w-12 shrink-0 text-center">
          <span className="block text-[11px] uppercase tracking-wide text-stone-400">{due.month}</span>
          <span className="block text-xl font-semibold leading-tight">{due.day}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{o.title}</span>
          <span className="mt-0.5 block text-sm text-stone-500">
            {o.form} · {companyName(o.companyId)} · {o.jurisdiction}
          </span>
          <span className={`mt-1 block text-sm ${o.maxPenalty >= 25000 ? "font-medium text-red-700" : "text-stone-600"}`}>
            If missed: {o.penalty}
          </span>
        </span>
        <span className="shrink-0 text-right text-sm">
          {pending ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">May apply</span>
          ) : (
            <span className="text-stone-500">{days === null ? "" : `${days} days`}</span>
          )}
        </span>
      </button>

      {pending && (
        <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 bg-amber-50/60 px-5 py-3 text-sm">
          <span className="mr-auto">{o.question}</span>
          <button onClick={() => onAnswer("yes")} className="rounded-lg bg-stone-900 px-3 py-1.5 text-white">
            Yes
          </button>
          <button onClick={() => onAnswer("no")} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5">
            No
          </button>
        </div>
      )}

      {open && (
        <div className="border-t border-stone-100 px-5 py-4 text-sm leading-relaxed">
          <h3 className="font-medium">Why you owe this</h3>
          <p className="mt-1 text-stone-700">{o.why}</p>
          <h3 className="mt-4 font-medium">What we need from you</h3>
          <ul className="mt-1 list-disc pl-5 text-stone-700">
            {o.need.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          {o.id === "5472" && (
            <a href="/draft" className="mt-4 inline-block rounded-lg bg-stone-900 px-4 py-2 font-medium text-white">
              Draft this filing
            </a>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-500">
            <span>Due {due.full}</span>
            {o.fee && <span>Fee {o.fee}</span>}
            <a href={o.source} target="_blank" rel="noreferrer" className="underline">
              Official source
            </a>
            {!o.verified && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">Draft rule, not yet verified</span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
