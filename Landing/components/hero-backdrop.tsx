"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useLang, type L } from "@/lib/i18n";

/**
 * Hero backdrop, two layers:
 * 1. A halftone dot screen on canvas. Dots near the cursor swell and warm to buff, like a loupe over a printed form.
 * 2. Paper filings floating at different depths. They drift with the cursor (parallax) and tilt toward it.
 */

const SPACING = 18;
const RADIUS = 170;
const BUFF = [232, 194, 122] as const;

function DotField(): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const target = { x: -9999, y: -9999, active: 0 };
    const cur = { x: -9999, y: -9999, active: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const r2 = RADIUS * RADIUS;
      for (let y = SPACING / 2; y < h; y += SPACING) {
        for (let x = SPACING / 2; x < w; x += SPACING) {
          const dx = x - cur.x;
          const dy = y - cur.y;
          const d2 = dx * dx + dy * dy;
          let k = 0;
          if (d2 < r2) {
            const f = 1 - Math.sqrt(d2) / RADIUS;
            k = f * f * cur.active;
          }
          const radius = 1 + k * 2.4;
          if (k > 0.02) {
            ctx.fillStyle = `rgba(${BUFF[0]},${BUFF[1]},${BUFF[2]},${0.18 + k * 0.75})`;
          } else {
            ctx.fillStyle = "rgba(255,255,255,0.16)";
          }
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const tick = () => {
      cur.x += (target.x - cur.x) * 0.18;
      cur.y += (target.y - cur.y) * 0.18;
      cur.active += (target.active - cur.active) * 0.12;
      draw();
      const settled =
        Math.abs(target.x - cur.x) < 0.5 && Math.abs(target.y - cur.y) < 0.5 && Math.abs(target.active - cur.active) < 0.01;
      raf = settled ? 0 : requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      if (cur.x < -1000) {
        cur.x = target.x;
        cur.y = target.y;
      }
      target.active = inside ? 1 : 0;
      kick();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (!reduced) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden="true" />;
}

type Sheet = {
  code: string;
  title: L;
  stamp?: L;
  x: string;
  y: string;
  rotate: number;
  depth: number;
  scale: number;
  hideMobile?: boolean;
};

const SHEETS: Sheet[] = [
  { code: "5472", title: { en: "Information Return", zh: "外資關係人申報" }, stamp: { en: "DUE APR 15", zh: "4/15 到期" }, x: "7%", y: "17%", rotate: -9, depth: 1, scale: 1 },
  { code: "1065", title: { en: "Partnership Return", zh: "合夥申報書" }, x: "15%", y: "52%", rotate: 6, depth: 0.55, scale: 0.82, hideMobile: true },
  { code: "K-1", title: { en: "Partner's Share", zh: "合夥人分配" }, x: "2%", y: "72%", rotate: -4, depth: 0.35, scale: 0.7, hideMobile: true },
  { code: "1120", title: { en: "Corporation Return", zh: "公司所得稅申報" }, x: "80%", y: "14%", rotate: 8, depth: 0.7, scale: 0.88 },
  { code: "DE", title: { en: "Delaware Annual Tax", zh: "Delaware 年度稅" }, stamp: { en: "$300 · JUN 1", zh: "$300 · 6/1" }, x: "86%", y: "48%", rotate: -7, depth: 1, scale: 0.95, hideMobile: true },
  { code: "7004", title: { en: "Extension", zh: "延期申請" }, x: "74%", y: "70%", rotate: 4, depth: 0.45, scale: 0.72, hideMobile: true },
];

function PaperSheet({ sheet, mx, my }: { sheet: Sheet; mx: MotionValue<number>; my: MotionValue<number> }): ReactNode {
  const { t } = useLang();
  const travel = 38 * sheet.depth;
  const x = useTransform(mx, (v) => v * travel);
  const y = useTransform(my, (v) => v * travel);
  const rotateY = useTransform(mx, (v) => v * 12 * sheet.depth);
  const rotateX = useTransform(my, (v) => v * -10 * sheet.depth);

  return (
    <motion.div
      className={`absolute ${sheet.hideMobile ? "max-[850px]:hidden" : ""}`}
      style={{ left: sheet.x, top: sheet.y, x, y, rotateX, rotateY, zIndex: Math.round(sheet.depth * 10), transformPerspective: 800 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.3 + (1 - sheet.depth) * 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <div
        className="hero-sheet-float"
        style={{ animationDelay: `${-sheet.depth * 4}s`, animationDuration: `${7 + sheet.depth * 3}s` }}
      >
        <div
          className="relative w-32 rounded-md bg-[#fbfaf6] px-3 pt-3 pb-4 text-[#0d1526] shadow-[0_18px_40px_-12px_rgb(5_14_40/0.55)]"
          style={{ transform: `rotate(${sheet.rotate}deg) scale(${sheet.scale})`, filter: `blur(${(1 - sheet.depth) * 1.2}px)`, opacity: 0.55 + sheet.depth * 0.45 }}
        >
          <span className="absolute top-0 right-0 size-4 rounded-bl-md bg-[#e6e1d3]" />
          <div className="flex items-baseline gap-1.5 border-b border-[#0d1526]/70 pb-1.5">
            <span className="text-[0.55rem] font-medium uppercase tracking-wide text-[#4a5470]">Form</span>
            <span className="text-lg font-bold leading-none tracking-tight">{sheet.code}</span>
          </div>
          <p className="mt-1.5 text-[0.55rem] font-medium leading-tight text-[#4a5470]">{t(sheet.title)}</p>
          <div className="mt-2.5 space-y-1.5" aria-hidden="true">
            {[100, 82, 92, 64].map((wd, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="size-1.5 rounded-[2px] border border-[#0d1526]/35" />
                <span className="h-px flex-1 bg-[#0d1526]/20" style={{ maxWidth: `${wd}%` }} />
              </div>
            ))}
          </div>
          {sheet.stamp && (
            <span className="absolute -right-3 bottom-3 -rotate-12 rounded-sm border-2 border-[#c8372d] px-1.5 py-0.5 text-[0.55rem] font-bold tracking-wider text-[#c8372d] bg-[#fbfaf6]/80">
              {t(sheet.stamp)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function HeroBackdrop(): ReactNode {
  const reduced = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { damping: 22, stiffness: 120 });
  const my = useSpring(rawY, { damping: 22, stiffness: 120 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el || window.innerWidth < 850) return;
      const r = el.getBoundingClientRect();
      if (e.clientY > r.bottom) return;
      rawX.set(((e.clientX - r.left) / r.width) * 2 - 1);
      rawY.set(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, rawX, rawY]);

  return (
    <div ref={ref} className="absolute inset-0 min-[850px]:inset-2.5 -z-10 overflow-hidden rounded-br-4xl rounded-bl-4xl" aria-hidden="true">
      <div className="hero-base absolute inset-0" />
      <DotField />
      {/* paper sheets live only in the headline band, above the product mock */}
      <div className="absolute inset-x-0 top-0 h-[880px] max-[850px]:hidden">
        {SHEETS.map((s) => (
          <PaperSheet key={s.code} sheet={s} mx={mx} my={my} />
        ))}
      </div>
    </div>
  );
}
