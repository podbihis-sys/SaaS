"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Magnetic } from "./ui/Magnetic";
import { CountUp } from "./ui/CountUp";

function KineticLine({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]"
        >
          <motion.span
            className="inline-block"
            initial={reduced ? false : { y: "115%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.9,
              delay: delay + i * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Hero({ dict }: { dict: Dictionary["hero"] }) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Pointer spotlight
  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const spotlight = useMotionTemplate`radial-gradient(28rem 28rem at ${mx}% ${my}%, rgba(60,197,201,0.16), transparent 70%)`;

  // Parallax drift on scroll
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const yFore = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const fade = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  const stats = [
    [dict.stat1Value, dict.stat1Label],
    [dict.stat2Value, dict.stat2Label],
    [dict.stat3Value, dict.stat3Label],
  ] as const;

  return (
    <section
      ref={sectionRef}
      className="aurora aurora-drift relative overflow-hidden pb-20 pt-36 sm:pt-44"
      onPointerMove={(e) => {
        const r = sectionRef.current?.getBoundingClientRect();
        if (!r) return;
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
    >
      {/* pointer spotlight */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{ background: spotlight }}
      />
      <div className="dotfield pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#04060f]" aria-hidden />

      <motion.div style={{ y: yFore, opacity }} className="container-site relative">
        <motion.div {...fade(0)} className="mb-8 flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-adriatic-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-adriatic-400" />
          </span>
          <span className="text-xs font-medium tracking-tight text-adriatic-200/90">{dict.badge}</span>
        </motion.div>

        <h1 className="max-w-[16ch] font-display text-[clamp(2.6rem,7.5vw,6rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-white">
          <KineticLine text={dict.title1} delay={0.1} className="block" />{" "}
          <span className="relative inline-block">
            <KineticLine text={dict.titleHighlight} delay={0.2} className="block text-adriatic-300" />
            <motion.span
              aria-hidden
              className="absolute -bottom-2 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-adriatic-400 to-coral-400"
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </span>
          <KineticLine text={dict.title2} delay={0.42} className="block text-slate-400" />
        </h1>

        <motion.p
          {...fade(0.7)}
          className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-slate-300/90"
        >
          {dict.subtitle}
        </motion.p>

        <motion.div {...fade(0.82)} className="mt-10 flex flex-wrap items-center gap-4">
          <Magnetic strength={0.35}>
            <a href="#contact" className="btn-primary">
              {dict.cta1}
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </Magnetic>
          <Magnetic strength={0.25}>
            <a href="#pricing" className="btn-secondary">
              {dict.cta2}
            </a>
          </Magnetic>
        </motion.div>

        <motion.dl {...fade(0.95)} className="mt-16 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          {stats.map(([value, label]) => (
            <div key={label} className="bg-[#04060f]/40 px-5 py-6 backdrop-blur-sm">
              <dd className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                <CountUp value={value} />
              </dd>
              <dt className="mt-1.5 text-xs text-slate-400">{label}</dt>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        {...fade(1.2)}
        className="container-site relative mt-14 hidden items-center gap-3 text-xs text-slate-500 sm:flex"
      >
        <motion.span
          aria-hidden
          className="block h-8 w-px bg-gradient-to-b from-adriatic-400/60 to-transparent"
          animate={reduced ? undefined : { scaleY: [1, 0.4, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
        {dict.scrollHint}
      </motion.div>
    </section>
  );
}
