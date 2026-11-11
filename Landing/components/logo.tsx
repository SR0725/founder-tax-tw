import type { ReactNode } from "react";

/** GoTax mark: a filed form (folded buff corner) with a check, on a colonial-blue tile. */
export function LogoMark({ className = "size-7" }: { className?: string | undefined }): ReactNode {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#24509C" />
      <path
        d="M9.5 6h9.2L24 11.3V25a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 8 25V7.5A1.5 1.5 0 0 1 9.5 6Z"
        fill="#FBFAF6"
      />
      <path d="M18.7 6v4.1c0 .7.5 1.2 1.2 1.2H24L18.7 6Z" fill="#E8C27A" />
      <path d="m11.6 17.6 3.2 3.2 5.8-6.6" stroke="#24509C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className = "", markClassName }: { className?: string; markClassName?: string | undefined }): ReactNode {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className="text-lg font-semibold tracking-tight leading-none">
        Go<span className="text-brand">Tax</span>
      </span>
    </span>
  );
}
