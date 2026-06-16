"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileText,
  Globe,
  LayoutDashboard,
  ScanLine,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/app/domains", label: "Domains", icon: Globe, ready: true },
  { href: "/app/scans", label: "Scans & Berichte", icon: ScanLine, ready: true },
  { href: "/app/statement", label: "Erklärung", icon: FileText, ready: false },
  { href: "/app/billing", label: "Abo & Rechnung", icon: CreditCard, ready: true },
  { href: "/app/settings", label: "Einstellungen", icon: Settings, ready: false },
] as const;

export function AppSidebar({ email, plan }: { email: string; plan: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="border-b px-5 py-4">
        <Link href="/app" className="font-semibold">
          BFSG-Monitor
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          const className = cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            active
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/50",
            !item.ready && "pointer-events-none opacity-50",
          );
          const inner = (
            <>
              <Icon className="size-4" aria-hidden />
              <span>{item.label}</span>
              {!item.ready && (
                <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                  bald
                </span>
              )}
            </>
          );

          return item.ready ? (
            <Link key={item.href} href={item.href} className={className}>
              {inner}
            </Link>
          ) : (
            <span key={item.href} className={className} aria-disabled="true">
              {inner}
            </span>
          );
        })}
      </nav>

      <div className="space-y-3 border-t p-4">
        <div className="text-sm">
          <p className="truncate font-medium" title={email}>
            {email}
          </p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Plan: {plan}
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Abmelden
          </button>
        </form>
      </div>
    </aside>
  );
}
