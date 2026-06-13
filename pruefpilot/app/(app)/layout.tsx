import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { hasAccess, isTrialing, trialDaysLeft } from "@/lib/billing";
import { getCompany, getUser } from "@/lib/data";

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
    <div className="min-h-screen bg-slate-50">
      {showTrialBanner ? (
        <div className="no-print bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-2 text-sm">
            <span className="inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              Testphase: noch <strong>{daysLeft} {daysLeft === 1 ? "Tag" : "Tage"}</strong> voller Funktionsumfang.
            </span>
            <form action="/api/stripe/checkout" method="post">
              <button
                type="submit"
                className="rounded-lg bg-white/15 px-3 py-1 font-semibold backdrop-blur transition-colors hover:bg-white/25"
              >
                Abo starten · 49 €/Monat netto
              </button>
            </form>
          </div>
        </div>
      ) : null}
      <header className="no-print sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/dashboard" className="mr-3 flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L15 10" />
                </svg>
              </span>
              PrüfPilot
            </Link>
            <Link href="/dashboard" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700">
              Dashboard
            </Link>
            <Link href="/geraete" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700">
              Geräte
            </Link>
            <Link href="/geraete/neu" className="hidden rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-700 sm:block">
              + Gerät anlegen
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {company.name}
            </span>
            <form action={logout}>
              <button type="submit" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800">
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
