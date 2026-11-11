"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

type Turn = { who: "you" | "gotax"; text: string };
type Phase = "idle" | "listening" | "thinking" | "speaking";

const ROUTES: Record<string, string> = {
  open_draft: "/draft?auto=1",
  open_filings: "/filings",
  open_documents: "/documents",
  open_review: "/review",
  open_companies: "/companies",
  open_taiwan: "/taiwan",
};

const T = {
  en: {
    open: "Ask GoTax",
    title: "GoTax assistant",
    hint: "Try: “What do I owe next?” or “Draft my Form 5472.”",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Speaking…",
    talk: "Hold a conversation",
    stop: "Stop",
    type: "Or type a question",
    send: "Send",
    noMic: "This browser has no speech recognition. Type instead, or open GoTax in Chrome.",
    micError: "The microphone didn't pick anything up. Try again or type.",
    failed: "Something went wrong. Try again.",
    close: "Close",
    you: "You",
    demo: "Demo only",
  },
  zh: {
    open: "問 GoTax",
    title: "GoTax 助理",
    hint: "試試看：「我下一個要報什麼？」或「幫我報 Form 5472」",
    listening: "正在聽…",
    thinking: "思考中…",
    speaking: "回答中…",
    talk: "按一下開始說話",
    stop: "停止",
    type: "或直接打字",
    send: "送出",
    noMic: "這個瀏覽器不支援語音辨識。請改用打字，或用 Chrome 開啟 GoTax。",
    micError: "麥克風沒有收到聲音。請再試一次，或改用打字。",
    failed: "發生錯誤，請再試一次。",
    close: "關閉",
    you: "你",
    demo: "僅供示範",
  },
};

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export function VoiceAssistant({ lang }: { lang: Lang }) {
  const t = T[lang];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [interim, setInterim] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [supported, setSupported] = useState(true);
  const rec = useRef<Recognition | null>(null);
  const heard = useRef("");
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    setSupported(Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition));
    return () => {
      rec.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [turns, interim, phase]);

  function speak(reply: string, then: () => void) {
    const synth = window.speechSynthesis;
    if (!synth) return then();
    synth.cancel();
    const u = new SpeechSynthesisUtterance(reply);
    u.lang = lang === "zh" ? "zh-TW" : "en-US";
    u.rate = 1.05;
    // Some browsers never fire onend (no voice installed, tab in background), so a timer
    // sized to the reply guarantees the conversation moves on.
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(guard);
      then();
    };
    const guard = setTimeout(done, Math.min(30_000, 2_500 + reply.length * (lang === "zh" ? 260 : 75)));
    u.onend = done;
    u.onerror = done;
    setPhase("speaking");
    synth.speak(u);
  }

  async function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    setError("");
    setTurns((p) => [...p, { who: "you", text: q }]);
    setPhase("thinking");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, lang }),
      });
      const data = (await res.json()) as { reply?: string; action?: string; error?: string };
      if (!res.ok || !data.reply) {
        setError(data.error ?? t.failed);
        setPhase("idle");
        return;
      }
      setTurns((p) => [...p, { who: "gotax", text: data.reply! }]);
      speak(data.reply, () => {
        setPhase("idle");
        const to = data.action ? ROUTES[data.action] : undefined;
        if (to) router.push(to);
      });
    } catch {
      setError(t.failed);
      setPhase("idle");
    }
  }

  function listen() {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return setSupported(false);
    window.speechSynthesis?.cancel();
    const r = new Ctor();
    r.lang = lang === "zh" ? "zh-TW" : "en-US";
    r.interimResults = true;
    r.continuous = false;
    heard.current = "";
    r.onresult = (e) => {
      let finalText = "";
      let live = "";
      for (let i = 0; i < e.results.length; i++) {
        const piece = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += piece;
        else live += piece;
      }
      heard.current = finalText || live;
      setInterim(finalText || live);
    };
    r.onerror = () => {
      setError(t.micError);
      setPhase("idle");
    };
    r.onend = () => {
      setInterim("");
      const said = heard.current;
      if (said) ask(said);
      else setPhase((p) => (p === "listening" ? "idle" : p));
    };
    rec.current = r;
    setError("");
    setInterim("");
    setPhase("listening");
    r.start();
  }

  function stop() {
    rec.current?.stop();
    window.speechSynthesis?.cancel();
    setPhase("idle");
  }

  const busy = phase !== "idle";
  const status = phase === "listening" ? t.listening : phase === "thinking" ? t.thinking : phase === "speaking" ? t.speaking : "";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-20 flex h-11 items-center gap-2 rounded-full bg-neutral-900 pl-3.5 pr-4 text-sm font-medium text-white shadow-lg shadow-neutral-900/20 hover:bg-neutral-700"
      >
        <Mic />
        {t.open}
      </button>
    );
  }

  return (
    <section
      aria-label={t.title}
      className="fixed inset-x-3 bottom-3 z-20 flex max-h-[70vh] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl shadow-neutral-900/10 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-96"
    >
      <header className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {t.title}
          <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500">{t.demo}</span>
        </div>
        <button
          onClick={() => {
            stop();
            setOpen(false);
          }}
          aria-label={t.close}
          className="grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100"
        >
          ✕
        </button>
      </header>

      <div ref={log} className="flex min-h-28 flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
        {turns.length === 0 && !interim && <p className="text-neutral-500">{t.hint}</p>}
        {turns.map((x, i) => (
          <p
            key={i}
            className={
              x.who === "you"
                ? "ml-8 self-end rounded-lg bg-neutral-900 px-3 py-2 text-white"
                : "mr-8 self-start rounded-lg bg-neutral-100 px-3 py-2 leading-relaxed text-neutral-800"
            }
          >
            {x.text}
          </p>
        ))}
        {interim && <p className="ml-8 self-end rounded-lg bg-neutral-200 px-3 py-2 text-neutral-600">{interim}</p>}
        {status && (
          <p className="flex items-center gap-2 text-[13px] text-neutral-500">
            <span className={`h-2 w-2 rounded-full ${phase === "listening" ? "animate-pulse bg-red-500" : "animate-pulse bg-blue-500"}`} />
            {status}
          </p>
        )}
        {!supported && <p className="rounded-lg bg-orange-50 px-3 py-2 text-[13px] text-orange-800">{t.noMic}</p>}
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-800">
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-neutral-100 p-3">
        <button
          onClick={busy ? stop : listen}
          disabled={!supported && !busy}
          className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 ${
            busy ? "bg-red-600 text-white hover:bg-red-500" : "bg-neutral-900 text-white hover:bg-neutral-700"
          }`}
        >
          <Mic />
          {busy ? t.stop : t.talk}
        </button>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (busy) return;
            ask(text);
            setText("");
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.type}
            aria-label={t.type}
            className="h-9 min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="h-9 rounded-lg border border-neutral-200 px-3 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-300"
          >
            {t.send}
          </button>
        </form>
      </div>
    </section>
  );
}

function Mic() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <rect x="5.5" y="1.5" width="5" height="8" rx="2.5" />
      <path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2" />
    </svg>
  );
}
