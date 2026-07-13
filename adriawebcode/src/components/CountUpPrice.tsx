"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Final amount, e.g. 3269.9 */
  value: number;
  /** Currency suffix, e.g. "€" or "KM". */
  currency: string;
  /** Fraction digits to render (2 for €/KM, 0 for RSD). */
  decimals: number;
  /** Seconds to wait before counting starts (matches the print choreography). */
  delay: number;
  className?: string;
};

const DURATION_MS = 1400;

/**
 * Counts the fixed price up like a meter settling on the final figure.
 * Server-rendered with the final value, so without JS (and under
 * prefers-reduced-motion) the price is simply there.
 */
export function CountUpPrice({ value, currency, decimals, delay, className }: Props) {
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const startAt = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - startAt) / DURATION_MS, 0), 1);
      const eased = 1 - Math.pow(1 - t, 4); // ease-out-quart
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    setDisplay(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, delay]);

  const formatted = display.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {formatted} {currency}
    </span>
  );
}
