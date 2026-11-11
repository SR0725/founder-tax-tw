"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Upload, ListChecks, FileText, ClipboardCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "@/lib/i18n";

const steps = [
  {
    icon: Upload,
    title: { en: "Upload your exports", zh: "上傳匯出檔" },
    description: {
      en: "Drop in your Stripe export and bank statements. We read the money flows between you and your company.",
      zh: "放進 Stripe 匯出檔和銀行對帳單，我們會讀出你和公司之間的每一筆金流。",
    },
  },
  {
    icon: ListChecks,
    title: { en: "See what you owe", zh: "看清楚該報什麼" },
    description: {
      en: "Every filing your company owes, with its due date and the penalty for missing it. Rules come from a fixed rule table with official sources, not from the model.",
      zh: "列出公司該報的每一項申報、到期日和漏報罰則。這些規則來自附官方來源的固定規則表，不是模型自己編的。",
    },
  },
  {
    icon: FileText,
    title: { en: "Get draft filings", zh: "拿到申報草稿" },
    description: {
      en: "AI fills in the drafts and flags every field it is unsure about, with the reason next to it.",
      zh: "AI 填好草稿，把每個沒把握的欄位標出來，旁邊附上原因。",
    },
  },
  {
    icon: ClipboardCheck,
    title: { en: "Review, then sign", zh: "審核，然後簽名" },
    description: {
      en: "A review checklist lets a non-CPA reviewer confirm each item. A licensed CPA only signs the final version.",
      zh: "沒有執照的審核員照著清單逐項確認，有執照的會計師只需要簽最後一版。",
    },
  },
];

const ease = [0.23, 1, 0.32, 1] as const;

export function HowItWorks(): ReactNode {
  const { t } = useLang();
  const listRef = useRef<HTMLOListElement>(null);

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 0.85", "end 0.55"],
  });

  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="relative w-full scroll-mt-24 bg-background">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end lg:gap-20">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t({ en: "How it works", zh: "運作方式" })}
          </h2>
          <div>
            <p className="max-w-md text-lg leading-relaxed text-foreground/60">
              {t({ en: "One flow from raw exports to a filing your CPA can sign.", zh: "從原始匯出檔一路做到會計師可以簽名的申報書。" })}{" "}
              <span className="font-medium text-foreground">
                {t({ en: "The CPA signs. They don't do the busywork.", zh: "會計師只負責簽名，不用做雜事。" })}
              </span>
            </p>
            <motion.a
              href="#coverage"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 inline-flex items-center rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              {t({ en: "See what we cover", zh: "看看涵蓋範圍" })}
            </motion.a>
          </div>
        </div>

        <ol ref={listRef} className="relative m-0 mt-16 grid list-none gap-10 p-0 md:grid-cols-4 md:gap-6 lg:mt-20">
          {/* connecting line (desktop) */}
          <li
            role="presentation"
            className="absolute top-6 left-6 right-[calc(25%-1.875rem)] hidden h-0.5 -translate-y-1/2 bg-foreground/10 md:block"
            aria-hidden="true"
          >
            <motion.div style={{ width: lineWidth }} className="h-full bg-brand" />
          </li>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.title.en}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease, delay: index * 0.08 }}
                className="relative flex gap-5 md:flex-col md:gap-0"
              >
                <div
                  className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand ring-8 ring-background"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <div className="pt-1 md:pt-6">
                  <h3 className="text-xl font-semibold text-foreground">{t(step.title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{t(step.description)}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
