"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Counts from 0 to the numeric part of `value` when scrolled into view, then
 * re-appends any non-numeric prefix/suffix (e.g. "60 Sek.", "5+", "7 Länder").
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  const match = value.match(/[\d.,]+/);
  const hasNumber = match !== null;
  const target = hasNumber ? Number(match![0].replace(/[.,]/g, "")) : 0;
  const prefix = hasNumber ? value.slice(0, match!.index) : "";
  const suffix = hasNumber ? value.slice((match!.index ?? 0) + match![0].length) : value;

  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!hasNumber) return;
    if (reduced || !inView) {
      // On reduced motion, show the final value immediately once mounted.
      if (reduced) setDisplay(target);
      return;
    }
    let raf = 0;
    const duration = 1100;
    let startTs: number | null = null;
    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const p = Math.min((now - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // target/hasNumber are derived from the stable `value` prop; intentionally
    // excluded to avoid restarting the animation on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced]);

  return (
    <span ref={ref} className={className}>
      {hasNumber ? `${prefix}${display.toLocaleString("de-DE")}${suffix}` : value}
    </span>
  );
}
