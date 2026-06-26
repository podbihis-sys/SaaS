"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { mainNav, site, type NavItem } from "@/lib/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-moss-100 bg-sand/90 backdrop-blur supports-[backdrop-filter]:bg-sand/80">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-moss-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Zum Inhalt springen
      </a>
      <div className="container-content flex items-center justify-between py-3">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`${site.name} – Startseite`}
        >
          <Image
            src={site.assets.logo}
            alt={`${site.legalName} Logo`}
            width={180}
            height={54}
            className="h-11 w-auto"
            priority
          />
        </Link>

        {/* Desktop-Navigation */}
        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) =>
              item.children ? (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-[15px] font-medium transition-colors hover:bg-moss-50 ${
                      isActive(item.href)
                        ? "text-moss-700"
                        : "text-anthracite-700"
                    }`}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <ul className="invisible absolute left-0 top-full w-60 rounded-2xl border border-moss-100 bg-white p-2 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    {item.children.map((child: NavItem) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-xl px-4 py-2 text-[15px] text-anthracite-700 hover:bg-moss-50 hover:text-moss-700"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-[15px] font-medium transition-colors hover:bg-moss-50 ${
                      isActive(item.href)
                        ? "text-moss-700"
                        : "text-anthracite-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <Link href="/kontakt" className="hidden btn-primary lg:inline-flex">
          Kontakt aufnehmen
        </Link>

        {/* Mobile-Toggle */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-anthracite-800 hover:bg-moss-50 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile-Menü */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile Navigation"
          className="border-t border-moss-100 bg-sand lg:hidden"
        >
          <ul className="container-content flex flex-col gap-1 py-4">
            {mainNav.map((item) =>
              item.children ? (
                <li key={item.href}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-base font-medium text-anthracite-800 hover:bg-moss-50"
                    aria-expanded={servicesOpen}
                    onClick={() => setServicesOpen((v) => !v)}
                  >
                    {item.label}
                    <svg
                      className={`h-5 w-5 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {servicesOpen && (
                    <ul className="ml-3 mt-1 space-y-1 border-l-2 border-moss-100 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded-lg px-3 py-2.5 text-[15px] text-anthracite-700 hover:bg-moss-50"
                            onClick={() => setOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-xl px-3 py-3 text-base font-medium text-anthracite-800 hover:bg-moss-50"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
            <li className="mt-2">
              <Link
                href="/kontakt"
                className="btn-primary w-full"
                onClick={() => setOpen(false)}
              >
                Kontakt aufnehmen
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
