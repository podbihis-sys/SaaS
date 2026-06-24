"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 13h6V4H4zM14 21h6v-9h-6zM14 4v5h6V4zM4 21h6v-5H4z" /> },
  { href: "/geraete", label: "Geräte", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
  { href: "/geraete/neu", label: "Gerät anlegen", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" /> },
  { href: "/einstellungen", label: "Einstellungen", icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M10.3 4.3a1 1 0 0 1 1-.8h1.4a1 1 0 0 1 1 .8l.2 1.3a6 6 0 0 1 1.5.9l1.2-.5a1 1 0 0 1 1.2.4l.7 1.2a1 1 0 0 1-.2 1.3l-1 .8a6 6 0 0 1 0 1.8l1 .8a1 1 0 0 1 .2 1.3l-.7 1.2a1 1 0 0 1-1.2.4l-1.2-.5a6 6 0 0 1-1.5.9l-.2 1.3a1 1 0 0 1-1 .8h-1.4a1 1 0 0 1-1-.8l-.2-1.3a6 6 0 0 1-1.5-.9l-1.2.5a1 1 0 0 1-1.2-.4l-.7-1.2a1 1 0 0 1 .2-1.3l1-.8a6 6 0 0 1 0-1.8l-1-.8a1 1 0 0 1-.2-1.3l.7-1.2a1 1 0 0 1 1.2-.4l1.2.5a6 6 0 0 1 1.5-.9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" /></> },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname.startsWith("/dashboard");
  if (href === "/geraete/neu") return pathname === "/geraete/neu";
  if (href === "/geraete") return pathname.startsWith("/geraete") && pathname !== "/geraete/neu";
  if (href === "/einstellungen") return pathname.startsWith("/einstellungen");
  return pathname === href;
}

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-none items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-[var(--side-active-bg)] font-semibold text-[color:var(--side-active-fg)]"
                : "font-medium text-[color:var(--side-muted)] hover:bg-[var(--side-hover-bg)] hover:text-[color:var(--side-hover-fg)]"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 flex-none">{item.icon}</svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
