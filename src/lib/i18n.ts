"use client";

import { useEffect, useState } from "react";

export type Lang = "en" | "zh";
export type L = { en: string; zh: string };

// Rough rate used only to give Taiwanese founders a sense of scale. Always labelled "approx".
export const TWD_PER_USD = 32;

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("lang");
    } catch {}
    const initial: Lang =
      stored === "en" || stored === "zh" ? stored : navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
    setLang(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant-TW" : "en";
  }, [lang]);

  return [
    lang,
    (l) => {
      setLang(l);
      try {
        localStorage.setItem("lang", l);
      } catch {}
    },
  ];
}

export function formatDate(iso: string, lang: Lang) {
  const d = new Date(`${iso}T00:00:00`);
  return {
    month: lang === "zh" ? `${d.getMonth() + 1} 月` : d.toLocaleString("en-US", { month: "short" }),
    day: String(d.getDate()),
    full:
      lang === "zh"
        ? `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`
        : d.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  };
}

export function twd(usd: number) {
  return `NT$${Math.round(usd * TWD_PER_USD).toLocaleString("en-US")}`;
}
