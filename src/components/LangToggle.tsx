"use client";

import type { Lang } from "@/lib/i18n";

export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const options: { id: Lang; label: string }[] = [
    { id: "zh", label: "繁體中文" },
    { id: "en", label: "English" },
  ];
  return (
    <div role="group" aria-label="Language" className="flex shrink-0 rounded-full bg-white p-0.5 text-sm ring-1 ring-stone-200">
      {options.map((o) => (
        <button
          key={`${o.id}-${lang}`}
          onClick={() => onChange(o.id)}
          aria-pressed={lang === o.id}
          className={`rounded-full px-3 py-1 ${
            lang === o.id ? "bg-stone-900 font-medium text-white" : "text-stone-500 hover:text-stone-900"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
