"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Phone, ShoppingCart, X } from "lucide-react";
import { useCart } from "../_lib/cart";
import { COMPANY } from "../_data/catalog";
import { NAV, type NavItem } from "../_data/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const navRef = useRef<HTMLElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Untermenü schließen: Escape und Klick außerhalb.
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openMenu]);

  // Beim Seitenwechsel alles schließen.
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSub(null);
  }, [pathname]);

  const isActive = (item: NavItem) => {
    if (item.href === "/bit") return pathname === "/bit";
    if (pathname.startsWith(item.href)) return true;
    return (item.children ?? []).some((c) => pathname.startsWith(c.href));
  };

  const hoverOpen = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "shadow-[0_8px_30px_-12px_rgba(15,39,66,0.18)]" : ""
      }`}
    >
      {/* Topbar */}
      <div className="hidden border-b border-slate-100 bg-slate-50/80 md:block">
        <div className="container flex h-9 items-center justify-between text-xs text-slate-500">
          <span>
            {COMPANY.shortName} · {COMPANY.city}
          </span>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1 transition-colors hover:text-[#1e4a7a]"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {COMPANY.phone}
            </a>
            <span>{COMPANY.hours}</span>
          </div>
        </div>
      </div>

      <div className="container flex h-32 items-center justify-between gap-4 sm:h-36">
        <Link
          href="/bit"
          className="shrink-0"
          aria-label="BIT – Startseite"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bit/logo.png"
            alt="BIT"
            className="h-24 w-auto transition-transform duration-300 hover:scale-105 lg:h-28 xl:h-32"
            width={656}
            height={128}
          />
        </Link>

        {/* Hauptnavigation mit Untermenüs – ab lg, darunter Burger-Menü. */}
        <nav
          ref={navRef}
          className="hidden shrink items-center gap-0.5 lg:flex xl:gap-1"
          aria-label="Hauptnavigation"
        >
          {NAV.map((item) => {
            const active = isActive(item);
            if (!item.children) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  className={`bit-nav-link whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors xl:px-3 ${
                    active ? "text-[#1e4a7a]" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            }
            const open = openMenu === item.label;
            return (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => hoverOpen(item.label)}
                onMouseLeave={hoverClose}
              >
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    data-active={active}
                    className={`bit-nav-link whitespace-nowrap rounded-lg py-2 pl-2.5 pr-1 text-sm font-medium transition-colors xl:pl-3 ${
                      active ? "text-[#1e4a7a]" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpenMenu(open ? null : item.label)}
                    aria-expanded={open}
                    aria-label={`Untermenü ${item.label} ${open ? "schließen" : "öffnen"}`}
                    className="rounded-md p-1 text-slate-500 hover:text-[#1e4a7a]"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                {open && (
                  <div className="absolute left-0 top-full z-50 w-72 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-2 text-sm transition-colors hover:bg-slate-50 hover:text-[#1e4a7a] ${
                          pathname === child.href
                            ? "font-semibold text-[#1e4a7a]"
                            : "text-slate-700"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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

      {/* Mobile nav – mit aufklappbaren Untermenüs */}
      {mobileOpen && (
        <nav
          id="bit-mobile-nav"
          className="max-h-[75vh] overflow-y-auto border-t border-slate-200 bg-white lg:hidden"
          aria-label="Hauptnavigation mobil"
        >
          <div className="container flex flex-col py-2">
            {NAV.map((item) => (
              <div key={item.href} className="border-b border-slate-100 last:border-b-0">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    className={`flex-1 rounded-lg px-3 py-3 text-sm font-medium ${
                      isActive(item) ? "text-[#1e4a7a]" : "text-slate-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      type="button"
                      onClick={() => setMobileSub(mobileSub === item.label ? null : item.label)}
                      aria-expanded={mobileSub === item.label}
                      aria-label={`Untermenü ${item.label} ${
                        mobileSub === item.label ? "schließen" : "öffnen"
                      }`}
                      className="rounded-md p-2 text-slate-500"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          mobileSub === item.label ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
                {item.children && mobileSub === item.label && (
                  <div className="pb-2 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#1e4a7a]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
