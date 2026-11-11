"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "@/lib/i18n";

const plans = [
  {
    name: { en: "Single-member LLC", zh: "單人 LLC" },
    price: "5472",
    priceLabel: { en: "+ pro forma 1120", zh: "+ 形式上的 1120" },
    description: { en: "One foreign owner, the most common setup for Taiwanese founders", zh: "一位外國股東，台灣創辦人最常見的架構" },
    features: [
      { en: "Form 5472 + pro forma 1120 · Apr 15", zh: "Form 5472 + 形式上的 1120 · 4/15" },
      { en: "Form 7004 extension · Oct 15", zh: "Form 7004 延期 · 10/15" },
      { en: "Delaware annual tax · Jun 1", zh: "Delaware 年度稅 · 6/1" },
      { en: "Taiwan CFC check", zh: "台灣 CFC 檢查" },
    ],
    popular: true,
  },
  {
    name: { en: "Multi-member LLC", zh: "多人 LLC" },
    price: "1065",
    priceLabel: { en: "+ K-1 per partner", zh: "+ 每位合夥人一張 K-1" },
    description: { en: "Two or more owners, taxed as a partnership", zh: "兩位以上股東，以合夥方式課稅" },
    features: [
      { en: "Form 1065 + Schedule K-1 · Mar 15", zh: "Form 1065 + Schedule K-1 · 3/15" },
      { en: "Form 8804 / 8805 for foreign partners", zh: "外國合夥人的 Form 8804 / 8805" },
      { en: "Delaware annual tax · Jun 1", zh: "Delaware 年度稅 · 6/1" },
      { en: "Taiwan overseas income check", zh: "台灣海外所得檢查" },
    ],
    popular: false,
  },
  {
    name: { en: "C-Corp", zh: "C-Corp" },
    price: "1120",
    priceLabel: { en: "corporate return", zh: "公司所得稅申報" },
    description: { en: "The usual setup for venture-backed startups", zh: "拿創投資金的新創常用架構" },
    features: [
      { en: "Form 1120 · Apr 15", zh: "Form 1120 · 4/15" },
      { en: "Form 5472 if 25%+ foreign-owned", zh: "外資持股 25% 以上要報 Form 5472" },
      { en: "Delaware franchise tax · Mar 1", zh: "Delaware 特許稅 · 3/1" },
      { en: "1099-NEC for US contractors", zh: "付給美國承包商要報 1099-NEC" },
    ],
    popular: false,
  },
];

const ease = [0.23, 1, 0.32, 1] as const;

function PricingCard({
  plan,
  index,
}: {
  plan: (typeof plans)[0];
  index: number;
}): ReactNode {
  const { t } = useLang();
  const isPopular = plan.popular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease, delay: index * 0.1 }}
      className="relative"
    >
      {isPopular && (
        <div className="absolute -inset-1 rounded-[1.2em] bg-brand" aria-hidden="true" />
      )}
      
      <div
        className={`relative flex h-full flex-col rounded-2xl bg-frame p-6 sm:p-8 ${
          isPopular ? "" : "border border-border"
        }`}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="inline-block rounded-full bg-brand px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              {t({ en: "Most common", zh: "最常見" })}
            </span>
          </div>
        )}

        <h3 className="text-xl font-semibold text-foreground">{t(plan.name)}</h3>

        <div className="mt-4">
          <div className="flex items-end gap-3">
            <span className="text-5xl font-bold tracking-tight text-foreground">
              {plan.price}
            </span>
            <span className="mb-1 text-sm text-muted-foreground">{t(plan.priceLabel)}</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(plan.description)}
          </p>
        </div>

        <motion.a
          href="#how-it-works"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
            isPopular
              ? "bg-brand text-white hover:bg-brand/90"
              : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          {t({ en: "Check my company", zh: "檢查我的公司" })}
        </motion.a>

        <div className="mt-8">
          <p className="text-sm font-medium text-muted-foreground">{t({ en: "What we check:", zh: "我們會檢查：" })}</p>
          <ul className="mt-4 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature.en} className="flex items-center gap-3">
                <Check
                  className="h-4 w-4 shrink-0 text-foreground"
                  strokeWidth={2.5}
                />
                <span className="text-sm text-foreground">{t(feature)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export function Coverage(): ReactNode {
  const { t } = useLang();
  return (
    <section id="coverage" className="w-full bg-background px-6 py-20 sm:py-28 scroll-mt-24">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-12 text-center sm:mb-16"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t({ en: "Pick your company type", zh: "選擇你的公司型態" })}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t({ en: "Each company type owes a different set of filings. Draft rules, still being verified against official sources.", zh: "不同公司型態要報的表不一樣。以下規則仍是草稿，正在對照官方來源查證。" })}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name.en} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
