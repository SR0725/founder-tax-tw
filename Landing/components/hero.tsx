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
import { MotionConfig, motion } from "motion/react";
import type { ReactNode } from "react";
import { HeroBackdrop } from "@/components/hero-backdrop";
import { useLang, type L } from "@/lib/i18n";

const ease = [0.23, 1, 0.32, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(8px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

const FORMS: L[] = [
  { en: "Form 5472", zh: "Form 5472" },
  { en: "Form 1120", zh: "Form 1120" },
  { en: "Form 1065", zh: "Form 1065" },
  { en: "Schedule K-1", zh: "Schedule K-1" },
  { en: "Form 7004", zh: "Form 7004" },
  { en: "Form 1099-NEC", zh: "Form 1099-NEC" },
  { en: "Form 1042-S", zh: "Form 1042-S" },
  { en: "FBAR", zh: "FBAR" },
  { en: "Delaware Franchise Tax", zh: "Delaware 特許稅" },
  { en: "Taiwan CFC", zh: "台灣 CFC" },
];

const NAV = [
  { icon: LayoutDashboard, label: { en: "Overview", zh: "總覽" }, active: true },
  { icon: FileText, label: { en: "Filings", zh: "申報表" } },
  { icon: CalendarClock, label: { en: "Deadlines", zh: "期限" } },
  { icon: FilePen, label: { en: "Drafts", zh: "草稿" } },
  { icon: ClipboardCheck, label: { en: "Review checklist", zh: "審核清單" } },
];

const DOCS = [
  { icon: Upload, label: { en: "Stripe export", zh: "Stripe 匯出檔" } },
  { icon: Landmark, label: { en: "Bank statements", zh: "銀行對帳單" } },
  { icon: Globe, label: { en: "Taiwan side", zh: "台灣端" } },
];

type Stat = { label: L; value: L; chip: L; note: L; sub: L; urgent?: boolean };

const STATS: Stat[] = [
  {
    label: { en: "Filings owed", zh: "應申報" },
    value: { en: "3", zh: "3" },
    chip: { en: "2026", zh: "2026" },
    note: { en: "Federal, Delaware, Taiwan", zh: "聯邦、Delaware、台灣" },
    sub: { en: "Based on your company profile", zh: "依你的公司資料判斷" },
  },
  {
    label: { en: "Next deadline", zh: "下個期限" },
    value: { en: "23 days", zh: "23 天" },
    chip: { en: "Apr 15", zh: "4/15" },
    note: { en: "Form 5472 + pro forma 1120", zh: "Form 5472 + 形式上的 1120" },
    sub: { en: "Extend to Oct 15 with Form 7004", zh: "可用 Form 7004 延到 10/15" },
    urgent: true,
  },
  {
    label: { en: "If missed", zh: "漏報罰則" },
    value: { en: "$25,000+", zh: "$25,000+" },
    chip: { en: "Exposure", zh: "風險" },
    note: { en: "Form 5472 alone is $25,000", zh: "光 Form 5472 就罰 $25,000" },
    sub: { en: "Per form, per year", zh: "每張、每年計" },
    urgent: true,
  },
  {
    label: { en: "Flagged", zh: "待確認" },
    value: { en: "4", zh: "4" },
    chip: { en: "Review", zh: "審核" },
    note: { en: "AI is unsure about these", zh: "AI 沒把握的欄位" },
    sub: { en: "Each one shows its reason", zh: "每一項都附上原因" },
  },
];

const TIMELINE = [
  { month: 3.5, label: { en: "Form 5472", zh: "Form 5472" }, date: { en: "Apr 15", zh: "4/15" }, urgent: true },
  { month: 4.97, label: { en: "Taiwan CFC", zh: "台灣 CFC" }, date: { en: "May 31", zh: "5/31" }, desktopOnly: true },
  { month: 5, label: { en: "Delaware tax", zh: "Delaware 年度稅" }, date: { en: "Jun 1", zh: "6/1" }, below: true, desktopOnly: true },
  { month: 9.5, label: { en: "Extended 5472", zh: "5472 延期" }, date: { en: "Oct 15", zh: "10/15" } },
];

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_ZH = MONTHS_EN.map((_, i) => `${i + 1}月`);

const COPY = {
  compliance: { en: "Compliance", zh: "合規" },
  documents: { en: "Documents", zh: "文件" },
  overview: { en: "Overview", zh: "總覽" },
  profile: { en: "Delaware LLC · single foreign owner · calendar year", zh: "Delaware LLC · 單一外國股東 · 曆年制" },
  upload: { en: "Upload files", zh: "上傳檔案" },
  timeline: { en: "Deadline timeline", zh: "期限時間軸" },
  timelineSub: { en: "Every filing for tax year 2026, from the rule table", zh: "2026 稅務年度的每一項申報，來自規則表" },
  tabs: [
    { en: "All", zh: "全部" },
    { en: "Federal", zh: "聯邦" },
    { en: "Delaware", zh: "Delaware" },
    { en: "Taiwan", zh: "台灣" },
  ],
  today: { en: "Today", zh: "今天" },
  flagged: { en: "Flagged", zh: "待確認" },
  ready: { en: "Ready", zh: "已完成" },
  line1: { en: "Never miss a", zh: "別再漏掉" },
  line2pre: { en: "", zh: "罰 " },
  line2post: { en: " filing", zh: " 的那張表" },
  sub: {
    en: "For Taiwanese founders with a Delaware company. Upload your Stripe and bank exports and see which US forms you owe, when they are due, and what missing them costs.",
    zh: "給住在台灣、手上有 Delaware 公司的創辦人。上傳 Stripe 和銀行匯出檔，馬上知道該報哪些美國表單、什麼時候到期、漏報要罰多少。",
  },
  cta: { en: "Check my company", zh: "檢查我的公司" },
};

const TODAY = 2.73; // Mar 23

const FLAGGED_ROWS: { form: L; field: L; flagged: boolean }[] = [
  { form: { en: "Form 5472 · Part IV", zh: "Form 5472 · 第 IV 部分" }, field: { en: "Capital contribution $12,000", zh: "股東出資 $12,000" }, flagged: true },
  { form: { en: "Form 5472 · Part V", zh: "Form 5472 · 第 V 部分" }, field: { en: "Owner loan repayment", zh: "股東借款還款" }, flagged: true },
  { form: { en: "Pro forma 1120", zh: "形式上的 1120" }, field: { en: "Company address", zh: "公司地址" }, flagged: false },
];

// One orchestrated moment: the mock "runs" after the files land.
// Stats arrive, the year fills up to today, deadlines drop onto the line, then flagged fields surface.
const T = { stats: 1.1, line: 1.6, dots: 2.5, rows: 2.9 };

function ResultPreview(): ReactNode {
  const { t, lang } = useLang();
  const MONTHS = lang === "zh" ? MONTHS_ZH : MONTHS_EN;
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
          <p className="px-5 pt-5 pb-2 text-xs text-[#5b6273]">{t(COPY.compliance)}</p>
          <ul className="space-y-0.5 px-2">
            {NAV.map(({ icon: Icon, label, active }) => (
              <li key={label.en} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${active ? "bg-[#eef2fa] font-medium text-brand" : ""}`}>
                <Icon className="size-4" aria-hidden="true" />
                {t(label)}
              </li>
            ))}
          </ul>
          <p className="px-5 pt-6 pb-2 text-xs text-[#5b6273]">{t(COPY.documents)}</p>
          <ul className="space-y-0.5 px-2">
            {DOCS.map(({ icon: Icon, label }, i) => (
              <li key={label.en} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm">
                <Icon className="size-4" aria-hidden="true" />
                {t(label)}
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
              <p className="font-medium">{t(COPY.overview)}</p>
              <p className="text-xs text-[#5b6273]">{t(COPY.profile)}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-deep px-3 py-1.5 text-xs font-medium text-white whitespace-nowrap">
              <Upload className="size-3.5" aria-hidden="true" /> {t(COPY.upload)}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label.en}
                className="rounded-xl border border-[#e6e8ee] p-4"
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: T.stats + i * 0.08, duration: 0.6, ease }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-[#5b6273]">{t(s.label)}</span>
                  <span className={`rounded-md border px-1.5 py-0.5 text-[0.65rem] font-medium whitespace-nowrap ${s.urgent ? "border-danger/30 text-danger" : "border-[#e6e8ee] text-[#5b6273]"}`}>
                    {t(s.chip)}
                  </span>
                </div>
                <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${s.urgent ? "text-danger" : ""}`}>{t(s.value)}</p>
                <p className="mt-3 text-xs font-medium">{t(s.note)}</p>
                <p className="mt-0.5 text-xs text-[#5b6273]">{t(s.sub)}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-[#e6e8ee] p-5">
            <div className="flex items-start justify-between gap-4 max-[850px]:flex-col">
              <div>
                <p className="font-medium">{t(COPY.timeline)}</p>
                <p className="text-xs text-[#5b6273]">{t(COPY.timelineSub)}</p>
              </div>
              <div className="flex overflow-hidden rounded-lg border border-[#e6e8ee] text-xs">
                {COPY.tabs.map((tab, i) => (
                  <span key={tab.en} className={i === 0 ? "bg-[#eef2fa] px-3 py-1.5 font-medium text-brand" : "border-l border-[#e6e8ee] px-3 py-1.5"}>
                    {t(tab)}
                  </span>
                ))}
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
                {t(COPY.today)}
              </motion.span>
              {TIMELINE.map((item, i) => (
                <div key={item.label.en} className="absolute -translate-x-1/2" style={{ left: `${(item.month / 12) * 100}%` }}>
                  <motion.div
                    className={`absolute left-1/2 -ml-1 -top-1 size-2 rounded-full ${item.urgent ? "bg-danger deadline-pulse" : "bg-[#8a93a8]"}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: T.dots + i * 0.12, type: "spring", stiffness: 500, damping: 18 }}
                  />
                  <motion.div
                    className={`absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap ${item.below ? "top-4" : "bottom-3"} ${"desktopOnly" in item ? "max-[850px]:hidden" : ""}`}
                    initial={{ opacity: 0, y: item.below ? -4 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: T.dots + i * 0.12 + 0.1, duration: 0.5, ease }}
                  >
                    <p className={`text-[0.7rem] font-semibold ${item.urgent ? "text-danger" : ""}`}>{t(item.label)}</p>
                    <p className="text-[0.65rem] text-[#5b6273]">{t(item.date)}</p>
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
            {FLAGGED_ROWS.map(({ form, field, flagged }, i) => (
              <motion.div
                key={field.en}
                className="grid grid-cols-[1fr_1.4fr_auto] items-center gap-4 border-b border-[#e6e8ee] px-4 py-2.5 text-xs last:border-0"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: T.rows + i * 0.1, duration: 0.5, ease }}
              >
                <span className="font-medium">{t(form)}</span>
                <span className="text-[#4a5470]">{t(field)}</span>
                <span className={`rounded-md px-2 py-0.5 font-medium ${flagged ? "bg-accent/45 text-brand-deep" : "bg-[#eef2fa] text-[#4a5470]"}`}>{t(flagged ? COPY.flagged : COPY.ready)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

export function Hero(): ReactNode {
  const { t, lang } = useLang();
  const logos: LogoItem[] = FORMS.map((form) => ({
    node: (
      <span className="whitespace-nowrap text-[0.6em] font-semibold tracking-tight text-white/75">{t(form)}</span>
    ),
    title: t(form),
  }));

  return (
    <section className="flex flex-col relative" style={{ colorScheme: "light" }}>
      <HeroBackdrop />

      <div className="flex items-start justify-center px-6 pt-64 max-[850px]:pt-32">
        <motion.div
          className="flex flex-col items-center max-[850px]:items-start text-center max-[850px]:text-left max-w-4xl max-[850px]:w-full"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.15, delayChildren: 0.2 }}
        >
          <h1 className={`${lang === "zh" ? "text-7xl" : "text-8xl"} max-[850px]:text-5xl font-medium tracking-tight leading-[1.05] mb-6 text-white [text-wrap:balance]`}>
            <motion.span
              className="block"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease }}
            >
              {t(COPY.line1)}
            </motion.span>
            <motion.span
              className="block"
              variants={fadeInUp}
              transition={{ duration: 0.8, ease }}
            >
              {t(COPY.line2pre)}
              <span className="text-accent tabular-nums">$25,000</span>
              {t(COPY.line2post)}
            </motion.span>
          </h1>

          <motion.p
            className="text-lg text-brand-ink mb-8 max-w-2xl"
            variants={fadeInUp}
            transition={{ duration: 0.8, ease }}
          >
            {t(COPY.sub)}
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
            <span className="relative z-10 px-6 py-3 rounded-xl bg-brand-deep text-white font-medium max-[850px]:flex-1">{t(COPY.cta)}</span>
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
