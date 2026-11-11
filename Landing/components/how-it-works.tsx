"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Upload, ListChecks, FileText, ClipboardCheck } from "lucide-react";
import type { ReactNode } from "react";

const steps = [
  {
    icon: Upload,
    title: "Upload your exports",
    description:
      "Drop in your Stripe export and bank statements. We read the money flows between you and your company.",
  },
  {
    icon: ListChecks,
    title: "See what you owe",
    description:
      "Every filing your company owes, with its due date and the penalty for missing it. Rules come from a fixed rule table with official sources, not from the model.",
  },
  {
    icon: FileText,
    title: "Get draft filings",
    description:
      "AI fills in the drafts and flags every field it is unsure about, with the reason next to it.",
  },
  {
    icon: ClipboardCheck,
    title: "Review, then sign",
    description:
      "A review checklist lets a non-CPA reviewer confirm each item. A licensed CPA only signs the final version.",
  },
];

const ease = [0.23, 1, 0.32, 1] as const;

export function HowItWorks(): ReactNode {
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
            How it works
          </h2>
          <div>
            <p className="max-w-md text-lg leading-relaxed text-foreground/60">
              One flow from raw exports to a filing your CPA can sign.{" "}
              <span className="font-medium text-foreground">
                The CPA signs. They don&apos;t do the busywork.
              </span>
            </p>
            <motion.a
              href="#coverage"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 inline-flex items-center rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              See what we cover
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
                key={step.title}
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
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{step.description}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
