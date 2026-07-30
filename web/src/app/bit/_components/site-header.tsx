"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, ShoppingCart, X } from "lucide-react";
import { useCart } from "../_lib/cart";
import { COMPANY } from "../_data/catalog";

const NAV = [
  { href: "/bit", label: "Home" },
  { href: "/bit/produkte", label: "Produkte" },
  { href: "/bit/news", label: "News" },
  { href: "/bit/kompetenzen", label: "Kompetenzen" },
  { href: "/bit/branchen", label: "Branchen" },
  { href: "/bit/unternehmen", label: "Die BIT" },
  { href: "/bit/karriere", label: "Karriere" },
  { href: "/bit/nachhaltigkeit", label: "Nachhaltigkeit" },
  { href: "/bit/kontakt", label: "Kontakt" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 6);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/bit" ? pathname === "/bit" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 bg-white/85 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "shadow-[0_8px_30px_-12px_rgba(15,39,66,0.18)]" : ""
      }`}
    >
      {/* Topbar */}
      <div className="hidden border-b border-slate-100 bg-slate-50/80 md:block">
        <div className="container flex h-9 items-center justify-between text-xs text-slate-500">
          <span>
            {COMPANY.legalName} · {COMPANY.city}
          </span>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1 transition-colors hover:text-[#1e4a7a]"
            >
              <Phone className="h-3.5 w-3.5" /> {COMPANY.phone}
            </a>
            <span>{COMPANY.hours}</span>
          </div>
        </div>
      </div>

      <div className="container flex h-24 items-center justify-between gap-4">
        <Link href="/bit" className="flex items-center gap-2.5" aria-label="BIT Bierther GmbH – Startseite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bit/logo.png"
            alt="BIT Bierther GmbH"
            className="h-14 w-auto transition-transform duration-300 hover:scale-105 sm:h-16"
            width={328}
            height={64}
          />
        </Link>

        {/* Ab 9 Menüpunkten passt die Leiste erst ab lg – darunter Burger-Menü,
            sonst überlappen die hinteren Links den Warenkorb-Button. */}
        <nav className="hidden shrink items-center gap-0.5 lg:flex xl:gap-1" aria-label="Hauptnavigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href)}
              className={`bit-nav-link whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors xl:px-3 ${
                isActive(item.href) ? "text-[#1e4a7a]" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            className="group relative flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
            aria-label={`Warenkorb öffnen${count > 0 ? `, ${count} Artikel` : ""}`}
          >
            <ShoppingCart className="h-5 w-5 transition-transform group-hover:-rotate-6" aria-hidden="true" />
            <span className="hidden sm:inline">Warenkorb</span>
            {count > 0 && (
              <span
                aria-hidden="true"
                className="bit-pulse absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#38bdf8] px-1 text-xs font-bold text-slate-900"
              >
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-full border border-slate-200 p-2 text-slate-700 lg:hidden"
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileOpen}
            aria-controls="bit-mobile-nav"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Scroll progress */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-transparent">
        <div
          className="h-full origin-left bg-gradient-to-r from-[#1e4a7a] to-[#38bdf8]"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav id="bit-mobile-nav" className="border-t border-slate-200 bg-white lg:hidden" aria-label="Hauptnavigation mobil">
          <div className="container flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-slate-100 text-[#1e4a7a]"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
