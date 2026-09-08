"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, ShoppingCart, X } from "lucide-react";
import { useCart } from "../_lib/cart";
import { COMPANY } from "../_data/catalog";
import { NAV, type NavItem } from "../_data/navigation";

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

  // Beim Seitenwechsel das mobile Menü schließen.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (item: NavItem) => {
    if (item.href === "/bit") return pathname === "/bit";
    if (pathname.startsWith(item.href)) return true;
    return (item.children ?? []).some((c) => pathname.startsWith(c.href));
  };

  const english = pathname.startsWith("/bit/en");

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "shadow-[0_8px_30px_-12px_rgba(15,39,66,0.18)]" : ""
      }`}
    >
      {/* Topbar */}
      <div className="hidden border-b border-slate-100 bg-slate-50/80 md:block">
        <div className="container flex h-9 items-center justify-between text-xs text-slate-500">
          <span>{COMPANY.legalName} – Verkauf nur an Gewerbekunden</span>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1 transition-colors hover:text-[#1e4a7a]"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {COMPANY.phone}
            </a>
            <span className="hidden lg:inline">{COMPANY.hours}</span>
            {/* Sprachwahl */}
            <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4 font-medium">
              <Link
                href="/bit"
                aria-current={!english ? "true" : undefined}
                className={!english ? "text-[#1e4a7a]" : "text-slate-500 hover:text-[#1e4a7a]"}
              >
                DE
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                href="/bit/en"
                aria-current={english ? "true" : undefined}
                className={english ? "text-[#1e4a7a]" : "text-slate-500 hover:text-[#1e4a7a]"}
              >
                EN
              </Link>
            </span>
          </div>
        </div>
      </div>

      <div className="container flex h-24 items-center justify-between gap-4 sm:h-28">
        <Link
          href="/bit"
          className="shrink-0"
          aria-label="BIT – Startseite"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bit/logo.png"
            alt="BIT"
            className="h-[67px] w-auto transition-transform duration-300 hover:scale-105 lg:h-[78px] xl:h-[90px]"
            width={656}
            height={128}
          />
        </Link>

        {/* Hauptnavigation – bewusst ohne Dropdowns (nur oberste Ebene). */}
        <nav
          className="hidden shrink items-center gap-0.5 lg:flex xl:gap-1"
          aria-label="Hauptnavigation"
        >
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                className={`bit-nav-link whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition-colors xl:px-2.5 ${
                  active ? "text-[#1e4a7a]" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={openCart}
            className="group relative flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-[#1e4a7a] hover:text-[#1e4a7a]"
            aria-label={`Warenkorb öffnen${count > 0 ? `, ${count} Artikel` : ""}`}
          >
            <ShoppingCart
              className="h-5 w-5 transition-transform group-hover:-rotate-6"
              aria-hidden="true"
            />
            <span className="hidden xl:inline">Warenkorb</span>
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
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Scroll progress */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-transparent" aria-hidden="true">
        <div
          className="h-full origin-left bg-gradient-to-r from-[#1e4a7a] to-[#38bdf8]"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>

      {/* Mobile nav – flache Liste ohne Untermenüs */}
      {mobileOpen && (
        <nav
          id="bit-mobile-nav"
          className="max-h-[75vh] overflow-y-auto border-t border-slate-200 bg-white lg:hidden"
          aria-label="Hauptnavigation mobil"
        >
          <div className="container flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b border-slate-100 px-3 py-3 text-sm font-medium last:border-b-0 ${
                  isActive(item) ? "text-[#1e4a7a]" : "text-slate-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-600">
              <span className="text-xs uppercase tracking-wide text-slate-400">Sprache:</span>
              <Link href="/bit" className={!english ? "text-[#1e4a7a]" : ""}>DE</Link>
              <Link href="/bit/en" className={english ? "text-[#1e4a7a]" : ""}>EN</Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
