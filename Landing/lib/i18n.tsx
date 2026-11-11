"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

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

export function LangProvider({ children }: { children: ReactNode }): ReactNode {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang");
      if (stored === "zh" || stored === "en") setLangState(stored);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant-TW" : "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  }, []);

  const t = useCallback((copy: L) => copy[lang], [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  return useContext(LangContext);
}
