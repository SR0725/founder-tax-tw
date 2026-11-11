"use client";

import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
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

type Status = "idle" | "sending" | "done" | "error" | "invalid";

const FORM_COPY = {
  placeholder: { en: "Enter your email", zh: "輸入你的 email" },
  label: { en: "Email address", zh: "Email 地址" },
  join: { en: "Join waitlist", zh: "加入候補名單" },
  sending: { en: "Joining…", zh: "送出中…" },
  done: { en: "You're on the list. We'll email you when GoTax opens.", zh: "已加入名單，GoTax 開放時會寄信通知你。" },
  invalid: { en: "That email doesn't look right. Check it and try again.", zh: "這個 email 格式好像不對，請確認後再試一次。" },
  error: { en: "We couldn't save that just now. Please try again in a minute.", zh: "目前無法送出，請稍後再試一次。" },
  privacy: { en: "We only use your email to tell you when GoTax opens.", zh: "你的 email 只會用來通知 GoTax 開放。" },
};

function WaitlistForm(): ReactNode {
  const { t, lang } = useLang();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const company = (new FormData(e.currentTarget).get("company") as string | null) ?? "";
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang, company }),
      });
      if (res.ok) {
        setStatus("done");
        setEmail("");
      } else {
        setStatus(res.status === 400 ? "invalid" : "error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p role="status" className="flex items-center gap-2 rounded-xl bg-background px-5 py-3.5 text-sm font-medium text-foreground shadow-lg">
        <Check className="size-4 text-brand" aria-hidden="true" />
        {t(FORM_COPY.done)}
      </p>
    );
  }

  const message = status === "invalid" ? FORM_COPY.invalid : status === "error" ? FORM_COPY.error : null;

  return (
    <div className="w-full max-w-md max-[850px]:max-w-none">
      <form
        onSubmit={submit}
        noValidate
        className="flex items-center w-full bg-background rounded-xl p-1.5 shadow-lg max-[850px]:flex-col max-[850px]:p-3 max-[850px]:gap-3"
      >
        <div className="flex items-center flex-1 w-full">
          <Mail className="w-5 h-5 text-muted-foreground ml-3 flex-none max-[850px]:ml-1" aria-hidden="true" />
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "invalid" || status === "error") setStatus("idle");
            }}
            placeholder={t(FORM_COPY.placeholder)}
            aria-label={t(FORM_COPY.label)}
            aria-invalid={status === "invalid"}
            aria-describedby={message ? "waitlist-message" : undefined}
            className="flex-1 px-3 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {/* honeypot for bots; hidden from people and screen readers */}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px opacity-0" />
        </div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-deep hover:bg-brand disabled:opacity-70 disabled:cursor-wait text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap max-[850px]:w-full max-[850px]:py-3"
        >
          {status === "sending" ? (
            <>
              {t(FORM_COPY.sending)}
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            </>
          ) : (
            <>
              {t(FORM_COPY.join)}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
      <p
        id="waitlist-message"
        role={message ? "alert" : undefined}
        className={`mt-3 text-sm ${message ? "font-medium text-accent" : "text-brand-ink/80"}`}
      >
        {t(message ?? FORM_COPY.privacy)}
      </p>
    </div>
  );
}

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
            
            <WaitlistForm />
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
