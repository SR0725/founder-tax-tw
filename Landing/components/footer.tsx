"use client";

import { ArrowRight, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "@/lib/i18n";
import { Logo } from "@/components/logo";

const footerLinks = {
  menu: [
    { label: { en: "How it works", zh: "運作方式" }, href: "#how-it-works" },
    { label: { en: "Coverage", zh: "涵蓋範圍" }, href: "#coverage" },
    { label: { en: "FAQ", zh: "常見問題" }, href: "#faq" },
  ],
  company: [
    { label: { en: "Built at c0mpiled-18 Taipei", zh: "c0mpiled-18 台北場作品" }, href: "https://luma.com/compiled-poy7" },
  ],
};

export function Footer(): ReactNode {
  const { t } = useLang();
  return (
    <footer className="relative pt-38 mt-24 mx-2.5 max-[850px]:mx-0">
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-full max-w-5xl">
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl/15">
          <div className="hero-field absolute inset-0" aria-hidden="true" />
          <div className="hero-rules absolute inset-0" aria-hidden="true" />
          
          <div className="relative z-10 flex flex-col items-center text-center px-12 py-24 max-[850px]:px-6 max-[850px]:py-6 max-[850px]:pt-12">
            <h2 className="text-6xl max-[850px]:text-3xl text-white font-medium tracking-tight [text-wrap:balance] max-w-2xl mb-14 max-[850px]:mb-8">
              {t({ en: "Know what your company owes before the IRS tells you", zh: "在 IRS 找上門之前，先知道公司該報什麼" })}
            </h2>
            
            <form className="flex items-center w-full max-w-md bg-background rounded-xl p-1.5 shadow-lg max-[850px]:flex-col max-[850px]:p-3 max-[850px]:gap-3 max-[850px]:max-w-none">
              <div className="flex items-center flex-1 w-full">
                <Mail className="w-5 h-5 text-muted-foreground ml-3 flex-none max-[850px]:ml-1" aria-hidden="true" />
                <input
                  type="email"
                  placeholder={t({ en: "Enter your email", zh: "輸入你的 email" })}
                  aria-label={t({ en: "Email address", zh: "Email 地址" })}
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-deep hover:bg-brand text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap max-[850px]:w-full max-[850px]:py-3"
              >
                {t({ en: "Join waitlist", zh: "加入候補名單" })}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-accent rounded-tr-[3rem] rounded-tl-[3rem] pt-96 pb-16 max-[850px]:pt-72">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-start justify-between gap-12 max-[850px]:flex-col max-[850px]:gap-10">
            <a href="#main-content" className="flex items-center gap-2 text-brand-deep" aria-label="GoTax home">
              <Logo markClassName="size-9" className="[&>span:last-child]:text-2xl [&>span:last-child>span]:text-brand-deep [&>span:last-child>span]:font-bold" />
            </a>

            <nav className="flex gap-16 max-[850px]:gap-10 max-[850px]:flex-wrap" aria-label="Footer navigation">
              <div>
                <h3 className="text-xs font-medium text-brand-deep/70 uppercase tracking-wider mb-4">{t({ en: "Product", zh: "產品" })}</h3>
                <ul className="space-y-2">
                  {footerLinks.menu.map((link) => (
                    <li key={link.label.en}>
                      <a href={link.href} className="text-sm text-brand-deep hover:text-brand transition-colors">
                        {t(link.label)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-medium text-brand-deep/70 uppercase tracking-wider mb-4">{t({ en: "Project", zh: "專案" })}</h3>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.label.en}>
                      <a href={link.href} className="text-sm text-brand-deep hover:text-brand transition-colors">
                        {t(link.label)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

            </nav>
          </div>

          <div className="mt-16 pt-6">
            <p className="text-sm text-brand-deep/70 text-center">
              © {new Date().getFullYear()} GoTax · {t({ en: "Not tax advice. Talk to a licensed CPA before you file.", zh: "本站不構成稅務建議，申報前請諮詢有執照的會計師。" })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
