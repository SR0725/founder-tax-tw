"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, type ReactNode } from "react";
import { FormDoc } from "@/components/form-doc";

const testimonials = [
  {
    code: "5472",
    quote:
      "A foreign-owned single-member LLC files Form 5472 with a pro forma Form 1120, even in a year with zero revenue.",
    name: "Form 5472",
    title: "Due Apr 15 · $25,000 penalty per missed form",
    company: "IRS",
  },
  {
    code: "1065",
    quote:
      "A multi-member LLC files Form 1065 and a Schedule K-1 for every partner. The late penalty is charged per partner, per month.",
    name: "Form 1065",
    title: "Due Mar 15 · penalty grows every month",
    company: "IRS",
  },
  {
    code: "DE",
    quote:
      "Delaware LLCs owe a flat annual tax by June 1. C-Corps file a franchise tax and annual report by March 1.",
    name: "Delaware",
    title: "LLC $300 by Jun 1 · C-Corp due Mar 1",
    company: "Delaware",
  },
  {
    code: "TW",
    quote:
      "Your US LLC pays no corporate tax, so Taiwan may treat it as a low-tax entity under its CFC rules. We flag it so you can confirm with a Taiwanese accountant.",
    name: "Taiwan CFC",
    title: "We flag it, a local accountant confirms",
    company: "Taiwan",
  },
];

const companies = [{ name: "IRS" }, { name: "Delaware" }, { name: "Taiwan" }];

export function Obligations(): ReactNode {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="obligations" className="w-full scroll-mt-24 bg-frame border-t border-b border-brand/10 px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-4xl leading-tight font-medium text-neutral-900 sm:text-5xl lg:mb-20 lg:text-6xl dark:text-neutral-50"
        >
          The filings nobody warns you about
        </motion.h2>

        <div className="mb-16 grid gap-8 lg:mb-20 lg:grid-cols-2 lg:gap-12">
          <div className="flex items-center justify-start gap-4 lg:gap-6" role="tablist" aria-label="Filings">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: activeIndex === index ? 1.05 : 0.92,
                  opacity: activeIndex === index ? 1 : 0.6,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative"
                role="tab"
                aria-selected={activeIndex === index}
                tabIndex={activeIndex === index ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                style={{ cursor: 'pointer' }}
              >
                <FormDoc
                  code={testimonial.code}
                  active={activeIndex === index}
                  className="h-16 w-12 sm:h-20 sm:w-16 lg:h-24 lg:w-[4.75rem]"
                />

                <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-neutral-900/10 dark:bg-neutral-50/10">
                  {activeIndex === index && (
                    <motion.div
                      key={`progress-${activeIndex}`}
                      className="h-full bg-neutral-900 dark:bg-neutral-50"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 10, ease: "linear" }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col justify-center" role="tabpanel" aria-live="polite">
            <AnimatePresence mode="wait">
              {testimonials[activeIndex] && (
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="mb-6 text-xl leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {testimonials[activeIndex].quote}
                  </p>
                  <div className="text-base font-medium text-neutral-900 sm:text-lg dark:text-neutral-100">
                    {testimonials[activeIndex].name},{" "}
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {testimonials[activeIndex].title}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 lg:gap-8">
          {companies.map((company, index) => {
            const isActive = testimonials[activeIndex]?.company === company.name;
            return (
              <motion.div
                key={company.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                className="flex items-center"
              >
                <span
                  className={`text-2xl font-semibold tracking-tight text-neutral-900 transition-opacity duration-300 sm:text-3xl dark:text-neutral-50 ${
                    isActive ? "opacity-100" : "opacity-25 hover:opacity-60"
                  }`}
                >
                  {company.name}
                </span>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-12 text-sm text-neutral-500 dark:text-neutral-400">
          Rules are drafts and still being checked against official IRS, Delaware and Taiwan sources. Not tax advice.
        </p>
      </div>
    </section>
  );
}
