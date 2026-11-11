import type { ReactNode } from "react";

/**
 * A small paper-form glyph: folded corner, form code on top, ruled lines below.
 * Used wherever the template originally showed an avatar.
 */
export function FormDoc({
  code,
  active = false,
  className = "",
}: {
  code: string;
  active?: boolean;
  className?: string;
}): ReactNode {
  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-md border px-1.5 pt-2 pb-1.5 shadow-sm transition-colors duration-500 ${
        active
          ? "border-brand bg-brand text-white"
          : "border-neutral-200 bg-white text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      } ${className}`}
      aria-hidden="true"
    >
      {/* folded corner */}
      <span
        className={`absolute top-0 right-0 size-3 rounded-bl-sm ${
          active ? "bg-white/25" : "bg-neutral-200 dark:bg-neutral-700"
        }`}
      />
      <span className="text-[0.62rem] leading-none font-bold tracking-tight">{code}</span>
      <span className="mt-auto flex flex-col gap-[3px]">
        <span className="h-[2px] w-full rounded-full bg-current opacity-20" />
        <span className="h-[2px] w-4/5 rounded-full bg-current opacity-20" />
        <span className="h-[2px] w-3/5 rounded-full bg-current opacity-20" />
      </span>
    </div>
  );
}
