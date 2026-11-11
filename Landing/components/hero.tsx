"use client";

import { LogoLoop, type LogoItem } from "@/components/logo-loop";
import {
  ArrowDownRight,
  CalendarClock,
  ClipboardCheck,
  FilePen,
  FileText,
  Globe,
  Landmark,
  LayoutDashboard,
  Upload,
} from "lucide-react";
import { MotionConfig, motion, useMotionValue, useSpring } from "motion/react";
import { useRef, type ReactNode, type MouseEvent } from "react";

const ease = [0.23, 1, 0.32, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

const FORMS = [
  "Form 5472",
  "Form 1120",
  "Form 1065",
  "Schedule K-1",
  "Form 7004",
  "Form 1099-NEC",
  "Form 1042-S",
  "FBAR",
  "Delaware Franchise Tax",
  "Taiwan CFC",
];

const logos: LogoItem[] = FORMS.map((form) => ({
  node: (
    <span className="whitespace-nowrap text-[0.6em] font-semibold tracking-tight text-white/75">
      {form}
    </span>
  ),
  title: form,
}));

const NAV = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: FileText, label: "Filings" },
  { icon: CalendarClock, label: "Deadlines" },
  { icon: FilePen, label: "Drafts" },
  { icon: ClipboardCheck, label: "Review checklist" },
];

const DOCS = [
  { icon: Upload, label: "Stripe export" },
  { icon: Landmark, label: "Bank statements" },
  { icon: Globe, label: "Taiwan side" },
];

const STATS = [
  { label: "Filings owed", value: "3", chip: "2026", note: "Federal, Delaware, Taiwan", sub: "Based on your company profile" },
  { label: "Next deadline", value: "23 days", chip: "Apr 15", note: "Form 5472 + pro forma 1120", sub: "Extend to Oct 15 with Form 7004", urgent: true },
  { label: "If missed", value: "$25,000+", chip: "Exposure", note: "Form 5472 alone is $25,000", sub: "Per form, per year", urgent: true },
  { label: "Flagged", value: "4", chip: "Review", note: "AI is unsure about these", sub: "Each one shows its reason" },
];

const TIMELINE = [
  { month: 3.5, label: "Form 5472", date: "Apr 15", urgent: true },
  { month: 4.97, label: "Taiwan CFC", date: "May 31", desktopOnly: true },
  { month: 5, label: "Delaware tax", date: "Jun 1", below: true, desktopOnly: true },
  { month: 9.5, label: "Extended 5472", date: "Oct 15" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TODAY = 2.73; // Mar 23

const FLAGGED_ROWS = [
  ["Form 5472 · Part IV", "Capital contribution $12,000", "Flagged"],
  ["Form 5472 · Part V", "Owner loan repayment", "Flagged"],
  ["Pro forma 1120", "Company address", "Ready"],
] as const;

// One orchestrated moment: the mock "runs" after the files land.
// Stats arrive, the year fills up to today, deadlines drop onto the line, then flagged fields surface.
const T = { stats: 1.1, line: 1.6, dots: 2.5, rows: 2.9 };

function ResultPreview(): ReactNode {
  const todayPct = `${(TODAY / 12) * 100}%`;
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex bg-white text-left text-[#0d1526]">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-[#e6e8ee] py-5 max-[850px]:hidden">
          <div className="flex items-center gap-2 px-5 pb-5 border-b border-[#e6e8ee]">
            <span className="flex size-6 items-center justify-center rounded-full bg-brand text-[0.6rem] font-bold text-white">L</span>
            <span className="font-semibold">Lanyu Labs LLC</span>
          </div>
          <p className="px-5 pt-5 pb-2 text-xs text-[#5b6273]">Compliance</p>
          <ul className="space-y-0.5 px-2">
            {NAV.map(({ icon: Icon, label, active }) => (
              <li key={label} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${active ? "bg-[#eef2fa] font-medium text-brand" : ""}`}>
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <p className="px-5 pt-6 pb-2 text-xs text-[#5b6273]">Documents</p>
          <ul className="space-y-0.5 px-2">
            {DOCS.map(({ icon: Icon, label }, i) => (
              <li key={label} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm">
                <Icon className="size-4" aria-hidden="true" />
                {label}
                {i < 2 && (
                  <motion.span
                    className="ml-auto size-1.5 rounded-full bg-brand"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.15, duration: 0.4, ease }}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1 p-6 max-[850px]:p-4">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Overview</p>
              <p className="text-xs text-[#5b6273]">Delaware LLC · single foreign owner · calendar year</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-deep px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap">
              <Upload className="size-3.5" aria-hidden="true" /> Upload files
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className="rounded-xl border border-[#e6e8ee] p-4"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: T.stats + i * 0.08, duration: 0.6, ease }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-[#5b6273]">{s.label}</span>
                  <span className={`rounded-md border px-1.5 py-0.5 text-[0.65rem] font-medium whitespace-nowrap ${s.urgent ? "border-danger/30 text-danger" : "border-[#e6e8ee] text-[#5b6273]"}`}>
                    {s.chip}
                  </span>
                </div>
                <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${s.urgent ? "text-danger" : ""}`}>{s.value}</p>
                <p className="mt-3 text-xs font-medium">{s.note}</p>
                <p className="mt-0.5 text-xs text-[#5b6273]">{s.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-[#e6e8ee] p-5">
            <div className="flex items-start justify-between gap-4 max-[850px]:flex-col">
              <div>
                <p className="font-medium">Deadline timeline</p>
                <p className="text-xs text-[#5b6273]">Every filing for tax year 2026, from the rule table</p>
              </div>
              <div className="flex overflow-hidden rounded-lg border border-[#e6e8ee] text-xs">
                <span className="bg-[#eef2fa] px-3 py-1.5 font-medium text-brand">All</span>
                <span className="border-l border-[#e6e8ee] px-3 py-1.5">Federal</span>
                <span className="border-l border-[#e6e8ee] px-3 py-1.5">Delaware</span>
                <span className="border-l border-[#e6e8ee] px-3 py-1.5">Taiwan</span>
              </div>
            </div>

            <div className="relative mt-14 mb-12 h-px bg-[#e6e8ee]">
              <motion.div
                className="absolute inset-y-0 left-0 h-0.5 -top-px origin-left bg-brand"
                style={{ width: todayPct }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: T.line, duration: 0.9, ease }}
              />
              <motion.div
                className="absolute -top-1.5 size-3 -translate-x-1/2 rounded-full border-2 border-brand bg-white"
                initial={{ left: "0%" }}
                animate={{ left: todayPct }}
                transition={{ delay: T.line, duration: 0.9, ease }}
              />
              <motion.span
                className="absolute top-3 -translate-x-1/2 text-[0.65rem] font-semibold whitespace-nowrap text-brand"
                style={{ left: todayPct }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: T.line + 0.7, duration: 0.4 }}
              >
                Today
              </motion.span>
              {TIMELINE.map((t, i) => (
                <div key={t.label} className="absolute -translate-x-1/2" style={{ left: `${(t.month / 12) * 100}%` }}>
                  <motion.div
                    className={`absolute left-1/2 -ml-1 -top-1 size-2 rounded-full ${t.urgent ? "bg-danger deadline-pulse" : "bg-[#8a93a8]"}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: T.dots + i * 0.12, type: "spring", stiffness: 500, damping: 18 }}
                  />
                  <motion.div
                    className={`absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap ${t.below ? "top-4" : "bottom-3"} ${"desktopOnly" in t ? "max-[850px]:hidden" : ""}`}
                    initial={{ opacity: 0, y: t.below ? -4 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: T.dots + i * 0.12 + 0.1, duration: 0.5, ease }}
                  >
                    <p className={`text-[0.7rem] font-semibold ${t.urgent ? "text-danger" : ""}`}>{t.label}</p>
                    <p className="text-[0.65rem] text-[#5b6273]">{t.date}</p>
                  </motion.div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[0.65rem] text-[#8a93a8] max-[850px]:hidden">
              {MONTHS.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-xl border border-[#e6e8ee]">
            {FLAGGED_ROWS.map(([form, field, status], i) => (
              <motion.div
                key={field}
                className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-4 border-b border-[#e6e8ee] px-4 py-2.5 text-xs last:border-0"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: T.rows + i * 0.1, duration: 0.5, ease }}
              >
                <span className="font-medium">{form}</span>
                <span className="text-[#4a5470]">{field}</span>
                <span className={`rounded-md px-2 py-0.5 font-medium ${status === "Flagged" ? "bg-accent/45 text-brand-deep" : "bg-[#eef2fa] text-[#4a5470]"}`}>{status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

const PARALLAX_INTENSITY = 20;

export function Hero(): ReactNode {
  const sectionRef = useRef<HTMLElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!sectionRef.current) return;
    
    if (window.innerWidth < 850) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);
    
    mouseX.set(offsetX * PARALLAX_INTENSITY);
    mouseY.set(offsetY * PARALLAX_INTENSITY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section 
      ref={sectionRef}
      className="flex flex-col relative" 
      style={{ colorScheme: 'light' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="absolute inset-0 min-[850px]:inset-2.5 -z-10 overflow-hidden rounded-br-4xl rounded-bl-4xl"
        aria-hidden="true"
      >
        <motion.div className="hero-field absolute -inset-8" style={{ x, y }} />
        <div className="hero-rules absolute inset-0" />
      </div>
      
      <div className="flex items-start justify-center px-6 pt-64 max-[850px]:pt-32">
        <motion.div
          className="flex flex-col items-center max-[850px]:items-start text-center max-[850px]:text-left max-w-4xl max-[850px]:w-full"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
        >
          <h1 className="text-8xl max-[850px]:text-5xl font-medium tracking-tight leading-[1.05] mb-6 text-white [text-wrap:balance]">
            <motion.span
              className="block"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease }}
            >
              Never miss a
            </motion.span>
            <motion.span
              className="block"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease }}
            >
              <span className="text-accent tabular-nums">$25,000</span> filing
            </motion.span>
          </h1>

          <motion.p
            className="text-lg text-brand-ink mb-8 max-w-2xl"
            variants={fadeInUp}
            transition={{ duration: 0.8, ease }}
          >
            For Taiwanese founders with a Delaware company. Upload your Stripe and bank exports
            and see which US forms you owe, when they are due, and what missing them costs.
          </motion.p>

          <motion.a
            href="#how-it-works"
            className="group relative cursor-pointer inline-flex items-center max-[850px]:w-full"
            variants={fadeInScale}
            transition={{ duration: 0.8, ease }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="absolute right-0 inset-y-0 w-[calc(100%-2rem)] max-[850px]:w-full rounded-xl bg-accent" />
            <span className="relative z-10 px-6 py-3 rounded-xl bg-brand-deep text-white font-medium max-[850px]:flex-1">Check my company</span>
            <span className="relative -left-px z-10 w-11 h-11 rounded-xl flex items-center justify-center text-brand-deep">
              <ArrowDownRight className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-45" />
            </span>
          </motion.a>
        </motion.div>
      </div>

      <motion.div
        className="relative px-6 mt-24 max-[850px]:mt-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease }}
      >
        <div className="relative max-w-5xl mx-auto">
          <div 
            className="relative rounded-2xl overflow-hidden border border-white/20 shadow-[0_24px_60px_-20px_rgb(8_20_50/0.55)] mask-[linear-gradient(to_bottom,black_75%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]"
          >
            <ResultPreview />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="pt-24 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1, ease }}
      >
        <LogoLoop logos={logos} speed={60} logoHeight={42} gap={124} />
      </motion.div>
    </section>
  );
}
