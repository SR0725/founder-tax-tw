"use client";

import { motion, type Transition } from "motion/react";
import { CircleAlert, Info, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { FormDoc } from "@/components/form-doc";
import { useLang, type L } from "@/lib/i18n";

const EASE = [0.23, 1, 0.32, 1] as const;

const DEPLOYMENT_STATS = [
  { icon: "US", label: { en: "US side", zh: "美國端" }, change: { en: "IRS + Delaware", zh: "IRS + Delaware" } },
  { icon: "TW", label: { en: "Taiwan side", zh: "台灣端" }, change: { en: "CFC + income", zh: "CFC + 海外所得" } },
];

const cardAnimation = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
};

const getCardTransition = (delay = 0): Transition => ({
  duration: 0.8,
  ease: EASE,
  delay,
});

function PhoneMockup({
  children,
  variant = "full",
}: {
  children: ReactNode;
  variant?: "full" | "compact";
}): ReactNode {
  const isCompact = variant === "compact";

  return (
    <div
      className={`
        relative bg-background shadow-2xl border-neutral-800 overflow-hidden z-10
        ${isCompact 
          ? "w-44 md:w-48 h-64 md:h-72 rounded-3xl border-4" 
          : "w-56 md:w-64 h-96 md:h-115 rounded-t-4xl border-6 border-b-0"
        }
      `}
    >
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 bg-neutral-800 rounded-full z-10
          ${isCompact ? "top-2 w-16 h-4" : "top-2 w-20 h-5"}
        `}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

const STACK = [
  { code: "5472", rotate: -14, x: -78 },
  { code: "1065", rotate: -6, x: -28 },
  { code: "1120", rotate: 4, x: 22 },
  { code: "K-1", rotate: 13, x: 72 },
];

function FormStack(): ReactNode {
  return (
    <div className="relative h-24 w-56" aria-hidden="true">
      {STACK.map((f, i) => (
        <div
          key={f.code}
          className="absolute left-1/2 top-2"
          style={{
            transform: `translateX(calc(-50% + ${f.x}px)) rotate(${f.rotate}deg)`,
            zIndex: i,
          }}
        >
          <FormDoc code={f.code} active={i === STACK.length - 1} className="h-20 w-16" />
        </div>
      ))}
    </div>
  );
}

function DeploymentStat({
  icon,
  label,
  change,
}: {
  icon: string;
  label: L;
  change: L;
}): ReactNode {
  const { t } = useLang();
  return (
    <div className="flex items-center justify-between bg-background rounded-xl p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 min-w-8 items-center justify-center rounded-md bg-brand px-1.5 text-[0.65rem] font-bold tracking-wide text-white">{icon}</span>
        <span className="text-foreground font-medium">{t(label)}</span>
      </div>
      <span className="text-muted-foreground text-sm font-medium">{t(change)}</span>
    </div>
  );
}

function DecorativeCircles(): ReactNode {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <div className="absolute size-56 border border-brand/30 rounded-full" />
      <div className="absolute size-72 border border-brand/20 rounded-full" />
      <div className="absolute size-88 border border-brand/10 rounded-full" />
    </div>
  );
}

function StepByStepCard(): ReactNode {
  const { t } = useLang();
  return (
    <motion.div
      {...cardAnimation}
      transition={getCardTransition(0)}
      className="group bg-card-primary rounded-4xl p-8 pb-0 overflow-hidden min-h-140 md:row-span-2 flex flex-col"
    >
      <div className="relative z-10 text-center mb-6 transition-transform duration-500 ease-out group-hover:scale-105">
        <h3 className="text-2xl md:text-4xl font-medium text-white leading-tight mb-3">
          {t({ en: "Drop in your exports. Get your filings.", zh: "丟進匯出檔，拿回該報的表。" })}
        </h3>
        <p className="text-brand-ink text-sm">
          {t({ en: "Upload a Stripe export and a bank statement. We read them and work out what your company owes.", zh: "上傳 Stripe 匯出檔和銀行對帳單，我們讀完後算出你的公司該報什麼。" })}
        </p>
      </div>

      <div className="flex-1 flex justify-center items-end transition-transform duration-500 ease-out group-hover:scale-[1.02]">
        <PhoneMockup variant="full">
          <div className="absolute inset-0 bg-phone-screen pt-14 px-5">
            <h4 className="text-3xl font-medium text-neutral-900 leading-none tracking-tight mt-4">
              {t({ en: "3 filings", zh: "找到 3 項" })}
            </h4>
            <h4 className="text-3xl font-medium text-neutral-900 leading-none tracking-tight mb-4">
              {t({ en: "found", zh: "應申報" })}
            </h4>
            <p className="text-sm text-neutral-500 leading-snug mb-8">
              {t({ en: "Single-member LLC with a foreign owner. Drafts are ready for review.", zh: "外國人持有的單人 LLC，草稿已經可以審核。" })}
            </p>

            {/* Project Card */}
            <div className="relative bg-linear-to-br from-accent via-accent/85 to-[#f3dcae] rounded-2xl p-4 h-52 shadow-xl overflow-hidden">
              <ProjectCardContent />
            </div>
          </div>
        </PhoneMockup>
      </div>
    </motion.div>
  );
}

function ProjectCardContent(): ReactNode {
  const { t } = useLang();
  return (
    <>
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,60 Q30,40 60,50 T100,30"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
        <path
          d="M0,55 Q40,35 70,45 T100,25"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
      </svg>

      <div className="relative z-10 flex items-start justify-between gap-3 h-full">
        <div>
          <p className="text-base font-semibold text-neutral-900">Form 5472</p>
          <p className="text-base font-semibold text-neutral-900">{t({ en: "+ pro forma 1120", zh: "+ 形式上的 1120" })}</p>
        </div>
        <CircleAlert className="opacity-40 text-black" aria-hidden="true" />
      </div>

      <div className="absolute bottom-3 left-5 flex items-center gap-2 text-neutral-700 text-xs tracking-widest" aria-hidden="true">
        <span>{t({ en: "DUE", zh: "到期" })}</span>
        <span>•</span>
        <span>{t({ en: "APR 15", zh: "4/15" })}</span>
        <span>•</span>
        <span>$25K</span>
      </div>
    </>
  );
}

function DashboardCard(): ReactNode {
  const { t } = useLang();
  return (
    <motion.div
      {...cardAnimation}
      transition={getCardTransition(0.1)}
      className="group bg-card-secondary rounded-4xl p-8 overflow-hidden min-h-80 relative flex flex-col md:block"
    >
      <div className="relative z-10 max-w-48 transition-transform duration-500 ease-out group-hover:scale-105">
        <h3 className="text-xl md:text-2xl whitespace-nowrap font-medium text-card-foreground leading-tight mb-3">
          {t({ en: "Deadlines & Penalties", zh: "期限與罰則" })}
        </h3>
        <p className="text-card-foreground-muted text-sm">
          {t({ en: "Every filing comes with its due date and what it costs to miss it", zh: "每一項申報都附上到期日，以及漏報的代價" })}
        </p>
      </div>

      <div className="relative md:absolute mt-8 md:mt-0 md:right-12 md:top-1/2 md:-translate-y-1/2 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-105 self-center md:self-auto">
        <DecorativeCircles />

        <PhoneMockup variant="compact">
          <div className="absolute inset-0 bg-phone-screen pt-9 px-3">
            <div className="bg-white rounded-full px-2 py-1.5 mb-3 flex items-center gap-1.5 border border-neutral-200">
              <span className="text-neutral-400 text-xs">Lanyu Labs LLC</span>
            </div>
            <p className="text-xs text-neutral-500 mb-0.5">{t({ en: "Next deadline", zh: "下個期限" })}</p>
            <p className="text-xl font-medium text-neutral-900 mb-3">{t({ en: "23 days", zh: "23 天" })}</p>

            <div className="flex gap-1.5 mb-4">
              <span className="bg-brand text-white text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
                {t({ en: "Federal", zh: "聯邦" })}
              </span>
              <span className="text-neutral-400 text-xs px-2 py-1 whitespace-nowrap">{t({ en: "Delaware", zh: "Delaware" })}</span>
              <span className="text-neutral-400 text-xs px-2 py-1 whitespace-nowrap">{t({ en: "Taiwan", zh: "台灣" })}</span>
            </div>
          </div>
        </PhoneMockup>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-brand-deep rounded-2xl px-5 py-3 shadow-xl z-20 whitespace-nowrap">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-brand-ink/80 text-xs">{t({ en: "If you miss it", zh: "如果漏報" })}</span>
            <Info className="size-3.5 text-brand-ink/60" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-white">$25,000</span>
            <span className="text-xs font-medium text-accent bg-accent/20 px-2 py-0.5 rounded">
              {t({ en: "per form", zh: "每張" })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TrustedByCard(): ReactNode {
  const { t } = useLang();
  return (
    <motion.div
      {...cardAnimation}
      transition={getCardTransition(0.2)}
      className="group bg-card-secondary rounded-4xl p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-64"
    >
      <div className="transition-transform duration-500 ease-out group-hover:scale-110">
        <h3 className="text-2xl md:text-3xl font-medium text-card-foreground leading-tight mb-1">
          {t({ en: "10+ US filings", zh: "追蹤 10 種以上" })}
        </h3>
        <h3 className="text-2xl md:text-3xl font-medium text-card-foreground leading-tight mb-5">
          {t({ en: "tracked", zh: "美國申報" })}
        </h3>
      </div>

      <div className="transition-transform duration-500 ease-out group-hover:scale-105">
        <FormStack />
      </div>

      <div className="flex items-center gap-2 mt-5 text-card-foreground-muted transition-transform duration-500 ease-out group-hover:scale-105">
        <ShieldCheck className="size-4" aria-hidden="true" />
        <span className="text-xs font-medium">{t({ en: "Every rule links to an official source", zh: "每條規則都附官方來源" })}</span>
      </div>
    </motion.div>
  );
}

function IntegrationsCard(): ReactNode {
  const { t } = useLang();
  return (
    <motion.div
      {...cardAnimation}
      transition={getCardTransition(0.3)}
      className="group bg-card-primary rounded-4xl p-6 md:p-8 flex flex-col min-h-64"
    >
      <div className="mb-auto transition-transform duration-500 ease-out group-hover:scale-105">
        <h3 className="text-xl md:text-2xl font-medium text-white leading-tight mb-2">
          {t({ en: "Both sides of the Pacific", zh: "太平洋兩岸一起顧" })}
        </h3>
        <p className="text-brand-ink text-sm">
          {t({ en: "US filings plus the Taiwan tax effects other services ignore", zh: "美國申報，加上其他服務不管的台灣稅務影響" })}
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-6 transition-transform duration-500 ease-out group-hover:scale-[1.02]">
        {DEPLOYMENT_STATS.map((stat) => (
          <DeploymentStat key={stat.icon} {...stat} />
        ))}
      </div>
    </motion.div>
  );
}

export function FeaturesBento(): ReactNode {
  return (
    <section className="w-full px-6 mb-32 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
          <StepByStepCard />
          <DashboardCard />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TrustedByCard />
            <IntegrationsCard />
          </div>
        </div>
      </div>
    </section>
  );
}
