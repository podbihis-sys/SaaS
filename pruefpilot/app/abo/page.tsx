import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { hasAccess } from "@/lib/billing";
import { getCompany, getUser } from "@/lib/data";

export default async function SubscriptionPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const company = await getCompany();
  if (!company) {
    redirect("/onboarding");
  }
  if (hasAccess(company)) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="card text-center">
        <h1 className="text-2xl font-bold">Ihre Testphase ist beendet</h1>
        <p className="mt-3 text-sm text-slate-600">
          Ihre Geräte, Fristen und Prüfnachweise bleiben gespeichert. Mit dem Abo (49 € netto/Monat,
          monatlich kündbar) arbeiten Sie ohne Unterbrechung weiter — inklusive automatischer
          Erinnerungen und Prüfbericht-Export.
        </p>
        <form action="/api/stripe/checkout" method="post" className="mt-6">
          <button type="submit" className="btn-primary w-full">
            Jetzt Abo starten — 49 €/Monat netto
          </button>
        </form>
        {company.stripe_customer_id ? (
          <form action="/api/stripe/portal" method="post" className="mt-3">
            <button type="submit" className="btn-secondary w-full">
              Rechnungen & Abo verwalten
            </button>
          </form>
        ) : null}
        <form action={logout} className="mt-6">
          <button type="submit" className="text-sm text-slate-500 underline">
            Abmelden
          </button>
        </form>
      </div>
    </main>
  );
}
