"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { locales, localeNames, type Locale } from "@/i18n/config";
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
      className={`fixed inset-x-0 top-0 z-50 bg-kalk transition-[border-color,padding] duration-200 ${
        scrolled ? "border-b border-rule py-3" : "border-b border-transparent py-5"
      }`}
    >
      <div className="container-site flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="text-[1.05rem] font-semibold tracking-tight text-ink"
          aria-label="adriawebcode"
        >
          adriawebcode
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink transition-colors hover:text-tiefsee"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-md border border-rule bg-paper px-3.5 py-2 text-sm font-medium uppercase text-ink transition-colors hover:border-ink"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              {locale}
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-44 rounded-md border border-rule bg-paper py-1"
                  role="listbox"
                >
                  {locales.map((l) => (
                    <li key={l}>
                      <button
                        onClick={() => switchLocale(l)}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-kalk ${
                          l === locale ? "font-semibold text-tiefsee" : "text-ink"
                        }`}
                        role="option"
                        aria-selected={l === locale}
                      >
                        {localeNames[l]}
                        <span className="text-xs uppercase text-muted">{l}</span>
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
            className="flex h-10 w-10 items-center justify-center rounded-md border border-rule bg-paper text-ink lg:hidden"
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
            className="overflow-hidden border-t border-rule bg-kalk lg:hidden"
            aria-label="Mobile"
          >
            <div className="container-site flex flex-col gap-1 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper hover:text-tiefsee"
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
