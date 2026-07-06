"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Hero({ dict }: { dict: Dictionary["hero"] }) {
  const reduced = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
  });

  return (
    <section className="hero-gradient relative overflow-hidden pb-24 pt-36 sm:pt-44">
      <div
        className="pointer-events-none absolute -right-40 top-20 h-96 w-96 rounded-full bg-adriatic-500/20 blur-3xl animate-pulse-soft"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-coral-500/10 blur-3xl animate-pulse-soft"
        aria-hidden
      />

      <div className="container-site relative">
        <motion.p
          {...fadeUp(0)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-adriatic-400/30 bg-adriatic-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-adriatic-200"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-adriatic-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-adriatic-400" />
          </span>
          {dict.badge}
        </motion.p>

        <motion.h1
          {...fadeUp(0.1)}
          className="max-w-4xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          {dict.title1}{" "}
          <span className="relative inline-block text-accent">
            {dict.titleHighlight}
            <motion.span
              aria-hidden
              className="absolute -bottom-1 left-0 h-[0.09em] w-full origin-left rounded-full bg-adriatic-400"
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            />
          </span>
          <br className="hidden sm:block" /> {dict.title2}
        </motion.h1>

        <motion.p {...fadeUp(0.22)} className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {dict.subtitle}
        </motion.p>

        <motion.div {...fadeUp(0.34)} className="mt-9 flex flex-wrap items-center gap-4">
          <a href="#contact" className="btn-primary">
            {dict.cta1}
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#pricing" className="btn-secondary">
            {dict.cta2}
          </a>
        </motion.div>

        <motion.dl {...fadeUp(0.48)} className="mt-16 grid max-w-xl grid-cols-3 gap-6">
          {[
            [dict.stat1Value, dict.stat1Label],
            [dict.stat2Value, dict.stat2Label],
            [dict.stat3Value, dict.stat3Label],
          ].map(([value, label]) => (
            <div key={label} className="border-l-2 border-adriatic-400/40 pl-4">
              <dt className="order-2 text-xs text-slate-400">{label}</dt>
              <dd className="order-1 font-display text-2xl font-bold text-white sm:text-3xl">{value}</dd>
            </div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
