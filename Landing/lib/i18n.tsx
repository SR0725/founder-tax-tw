"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

// Same shape as the main app (src/lib/i18n.ts): "en" for judges, "zh" (Traditional Chinese, Taiwan) for users.
// The landing page defaults to English; the choice is remembered under the same "lang" key.
export type Lang = "en" | "zh";
export type L = { en: string; zh: string };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (copy: L) => string;
};

const LangContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (copy) => copy.en,
});

const EVENT = "gotax-lang-change";
// Fallback when storage is blocked (private mode, sandboxed previews).
let memoryLang: Lang = "en";

function readLang(): Lang {
  try {
    const stored = localStorage.getItem("lang");
    if (stored === "zh" || stored === "en") return stored;
  } catch {}
  return memoryLang;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function LangProvider({ children }: { children: ReactNode }): ReactNode {
  // Server render and first client render are English; the stored choice applies right after hydration.
  const lang = useSyncExternalStore(subscribe, readLang, () => "en" as Lang);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant-TW" : "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    memoryLang = l;
    try {
      localStorage.setItem("lang", l);
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const t = useCallback((copy: L) => copy[lang], [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  return useContext(LangContext);
}
