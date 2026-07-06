"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Counts from 0 to the numeric part of `value` when scrolled into view, then
 * re-appends any non-numeric prefix/suffix (e.g. "60 Sek.", "5+", "7").
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  const match = value.match(/[\d.,]+/);
  const target = match ? Number(match[0].replace(/[.,]/g, "")) : 0;
  const prefix = match ? value.slice(0, match.index) : "";
  const suffix = match ? value.slice((match.index ?? 0) + match[0].length) : value;

  const [display, setDisplay] = useState(reduced ? target : 0);

  useEffect(() => {
    if (!inView || reduced || !match) {
      if (reduced) setDisplay(target);
      return;
    }
    let raf = 0;
    const duration = 1100;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, target, match]);

  return (
    <span ref={ref} className={className}>
      {match ? `${prefix}${display.toLocaleString("de-DE")}${suffix}` : value}
    </span>
  );
}
