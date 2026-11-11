"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useLang } from "@/lib/i18n";
import { APP_URL } from "@/lib/config";

const faqs = [
  {
    question: { en: "Is this tax advice?", zh: "這算稅務建議嗎？" },
    answer: {
      en: "No. GoTax finds your obligations and prepares drafts. A licensed US CPA signs the final filing, and Taiwan-side items go to a Taiwanese accountant.",
      zh: "不算。GoTax 幫你找出申報義務並準備草稿，最後的申報由有執照的美國會計師簽名，台灣端的項目則交給台灣會計師。",
    },
  },
  {
    question: { en: "Who is it for?", zh: "誰適合用？" },
    answer: {
      en: "Founders who live in Taiwan and own a US company, usually a Delaware LLC or C-Corp. Most of them track things in a spreadsheet today and pay a US accountant at the end of the year.",
      zh: "住在台灣、名下有美國公司的創辦人，多半是 Delaware 的 LLC 或 C-Corp。他們大多用試算表自己記，年底再付錢給美國會計師。",
    },
  },
  {
    question: { en: "Does the AI decide my deadlines and penalties?", zh: "期限和罰則是 AI 決定的嗎？" },
    answer: {
      en: "No. Deadlines, penalties and thresholds live in a fixed rule table, and every rule links to an official source. The model only reads your data, fills in drafts and explains them.",
      zh: "不是。期限、罰則和門檻都寫在固定的規則表裡，每條規則都附官方來源。模型只負責讀你的資料、填草稿和解釋。",
    },
  },
  {
    question: { en: "What do I need to upload?", zh: "我需要上傳什麼？" },
    answer: {
      en: "Your Stripe export and your bank statements. We also ask for basics like company type, formation date, owners and their tax residency.",
      zh: "Stripe 匯出檔和銀行對帳單。另外會請你填幾項基本資料，例如公司型態、成立日期、股東和他們的稅務居民身分。",
    },
  },
  {
    question: { en: "How is this different from doola or Firstbase?", zh: "跟 doola、Firstbase 有什麼不同？" },
    answer: {
      en: "They cover the US side only, with a team of accountants behind the software. We cover the Taiwan side too, and a reviewer without a CPA license can handle most of the work using our checklist.",
      zh: "它們只處理美國端，靠軟體背後的一整群會計師。我們連台灣端也一起看，而且沒有會計師執照的審核員照著我們的清單，就能完成大部分工作。",
    },
  },
];

const ease = [0.23, 1, 0.32, 1] as const;

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}): ReactNode {
  const { t } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease, delay: index * 0.05 }}
      onClick={onToggle}
      className="cursor-pointer rounded-2xl bg-frame p-5 shadow-sm sm:p-6"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-expanded={isOpen}
    >
      <div className="flex w-full items-center justify-between gap-4 text-left">
        <span className="text-base font-medium text-foreground sm:text-lg">
          {t(faq.question)}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease }}
          className="shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t(faq.answer)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ(): ReactNode {
  const { t } = useLang();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full scroll-mt-24 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-12 text-center sm:mb-16"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t({ en: "Questions founders ask us", zh: "創辦人常問的問題" })}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t({ en: "Short answers. Not tax advice.", zh: "簡短回答，不構成稅務建議。" })}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <motion.a
              href={APP_URL}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center rounded-xl bg-foreground px-6 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              {t({ en: "Check my company", zh: "檢查我的公司" })}
            </motion.a>
          </div>
        </motion.div>

        <div className="flex flex-col gap-3" role="list">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
