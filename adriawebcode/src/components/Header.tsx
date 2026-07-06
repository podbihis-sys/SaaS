"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#services", label: dict.services },
    { href: "#pricing", label: dict.pricing },
    { href: "#maintenance", label: dict.maintenance },
    { href: "#process", label: dict.process },
    { href: "#faq", label: dict.faq },
  ];

  const switchLocale = (target: Locale) => {
    document.cookie = `locale=${target};path=/;max-age=31536000`;
    const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
    window.location.href = `/${target}${rest}`;
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/[0.07] bg-[#04060f]/80 py-3 backdrop-blur-xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container-site flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2.5" aria-label="adriawebcode">
          <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden>
            <rect width="64" height="64" rx="14" fill="#111d4a" />
            <path
              d="M14 46 L28 18 L34 30 L40 18 L54 46"
              fill="none"
              stroke="#3cc5c9"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="34" cy="46" r="3.5" fill="#ff6b4a" />
          </svg>
          <span className="font-display text-lg font-bold text-white">
            adria<span className="text-adriatic-400">web</span>code
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition hover:text-adriatic-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-medium text-white transition hover:border-adriatic-400/50"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <span aria-hidden>{localeFlags[locale]}</span>
              <span className="uppercase">{locale}</span>
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-navy-900/95 py-1 shadow-2xl backdrop-blur-xl"
                  role="listbox"
                >
                  {locales.map((l) => (
                    <li key={l}>
                      <button
                        onClick={() => switchLocale(l)}
                        className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition hover:bg-white/10 ${
                          l === locale ? "text-adriatic-300" : "text-slate-200"
                        }`}
                        role="option"
                        aria-selected={l === locale}
                      >
                        <span aria-hidden>{localeFlags[l]}</span>
                        {localeNames[l]}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <a href="#contact" className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">
            {dict.cta}
          </a>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white lg:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden>
              {menuOpen ? (
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-navy-950/95 backdrop-blur-xl lg:hidden"
            aria-label="Mobile"
          >
            <div className="container-site flex flex-col gap-1 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-adriatic-300"
                >
                  {link.label}
                </a>
              ))}
              <a href="#contact" onClick={() => setMenuOpen(false)} className="btn-primary mt-2">
                {dict.cta}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
