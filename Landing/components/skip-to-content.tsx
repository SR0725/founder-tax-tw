"use client";

import type { ReactNode } from "react";
import { useLang } from "@/lib/i18n";

export function SkipToContent(): ReactNode {
  const { t } = useLang();
  return (
    <a href="#main-content" className="skip-to-content">
      {t({ en: "Skip to main content", zh: "跳到主要內容" })}
    </a>
  );
}
