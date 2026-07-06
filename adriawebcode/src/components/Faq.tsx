"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Reveal } from "./Reveal";

export function Faq({ dict }: { dict: Dictionary["faq"] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 border-y border-white/5 bg-navy-900/30 py-24">
      <div className="container-site max-w-3xl">
        <Reveal className="text-center">
          <span className="kicker">{dict.kicker}</span>
          <h2 className="section-title">{dict.title}</h2>
        </Reveal>
        <div className="mt-12 flex flex-col gap-3">
          {dict.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 0.05} y={16}>
                <div
                  className={`card-glass overflow-hidden transition-colors ${
                    isOpen ? "border-adriatic-400/40" : ""
                  }`}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-white">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-adriatic-300"
                      aria-hidden
                    >
                      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
