import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { SidebarNav } from "@/components/sidebar-nav";
import { hasAccess, isTrialing, trialDaysLeft } from "@/lib/billing";
import { getCompany, getUser } from "@/lib/data";

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L15 10" />
        </svg>
      </span>
      PrüfPilot
    </Link>
  );
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const company = await getCompany();
  if (!company) {
    redirect("/onboarding");
  }
  if (!hasAccess(company)) {
    redirect("/abo");
  }
  const showTrialBanner = isTrialing(company);
  const daysLeft = showTrialBanner ? trialDaysLeft(company) : 0;

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar (Desktop) */}
      <aside className="no-print hidden lg:flex lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="flex h-16 items-center border-b border-slate-200 px-6">
            <Logo />
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Verwaltung</p>
            <SidebarNav />
          </div>
          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
                {company.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 truncate font-medium text-slate-700">{company.name}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l5-5m0 0-5-5m5 5H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                </svg>
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Content-Spalte */}
      <div className="flex min-h-screen flex-col">
        {/* Mobile-Header */}
        <header className="no-print border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo />
            <form action={logout}>
              <button type="submit" className="text-sm font-medium text-slate-500 hover:text-slate-800">Abmelden</button>
            </form>
          </div>
          <div className="mt-3">
            <SidebarNav />
          </div>
        </header>

        {showTrialBanner ? (
          <div className="no-print bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-2 text-sm">
              <span className="inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                Testphase: noch <strong>{daysLeft} {daysLeft === 1 ? "Tag" : "Tage"}</strong> voller Funktionsumfang.
              </span>
              <form action="/api/stripe/checkout" method="post">
                <button type="submit" className="rounded-lg bg-white/15 px-3 py-1 font-semibold backdrop-blur transition-colors hover:bg-white/25">
                  Abo starten · 49 €/Monat netto
                </button>
              </form>
            </div>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
