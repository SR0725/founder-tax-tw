"use client";

import type { Lang } from "@/lib/i18n";

export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const options: { id: Lang; label: string }[] = [
    { id: "zh", label: "繁體中文" },
    { id: "en", label: "English" },
  ];
  return (
    <div role="group" aria-label="Language" className="flex shrink-0 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 text-[13px]">
      {options.map((o) => (
        <button
          key={`${o.id}-${lang}`}
          onClick={() => onChange(o.id)}
          aria-pressed={lang === o.id}
          className={`rounded-md px-2.5 py-1 ${
            lang === o.id ? "bg-white font-medium text-neutral-900 shadow-sm ring-1 ring-neutral-200" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
