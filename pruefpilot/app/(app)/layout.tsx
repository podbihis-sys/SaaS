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
    <div className="min-h-screen">
      {showTrialBanner ? (
        <div className="no-print border-b border-blue-200 bg-blue-50">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-2 text-sm text-blue-900">
            <span>
              Testphase: noch {daysLeft} {daysLeft === 1 ? "Tag" : "Tage"} voller Funktionsumfang.
            </span>
            <form action="/api/stripe/checkout" method="post">
              <button type="submit" className="font-medium underline">
                Abo starten (49 €/Monat netto)
              </button>
            </form>
          </div>
        </div>
      ) : null}
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-semibold text-blue-800">
              PrüfPilot
            </Link>
            <Link href="/dashboard" className="text-sm text-slate-700 hover:text-blue-700">
              Dashboard
            </Link>
            <Link href="/geraete" className="text-sm text-slate-700 hover:text-blue-700">
              Geräte
            </Link>
            <Link href="/geraete/neu" className="text-sm text-slate-700 hover:text-blue-700">
              + Gerät anlegen
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{company.name}</span>
            <form action={logout}>
              <button type="submit" className="text-sm text-slate-500 underline hover:text-slate-700">
                Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
