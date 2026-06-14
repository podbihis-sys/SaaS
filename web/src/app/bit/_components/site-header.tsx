"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Phone, ShoppingCart, X } from "lucide-react";
import { useCart } from "../_lib/cart";
import { COMPANY } from "../_data/catalog";

const NAV = [
  { href: "/bit", label: "Start" },
  { href: "/bit/produkte", label: "Produkte" },
  { href: "/bit/unternehmen", label: "Unternehmen" },
  { href: "/bit/qualitaet", label: "Qualität" },
  { href: "/bit/kontakt", label: "Kontakt" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/bit" ? pathname === "/bit" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      {/* Topbar */}
      <div className="hidden border-b border-slate-100 bg-slate-50 md:block">
        <div className="container flex h-9 items-center justify-between text-xs text-slate-500">
          <span>{COMPANY.legalName} · {COMPANY.city}</span>
          <div className="flex items-center gap-4">
            <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="flex items-center gap-1 hover:text-[#1e4a7a]">
              <Phone className="h-3.5 w-3.5" /> {COMPANY.phone}
            </a>
            <span>{COMPANY.hours}</span>
          </div>
        </div>
      </div>

      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/bit" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e4a7a] font-bold text-white">
            BIT
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-base font-semibold text-slate-900">BIT Bierther</span>
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              Schrumpf- & Isoliertechnik
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-slate-100 text-[#1e4a7a]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            aria-label="Warenkorb öffnen"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Warenkorb</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f59e0b] px-1 text-xs font-bold text-slate-900">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
            aria-label="Menü"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-slate-200 bg-white md:hidden">
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
