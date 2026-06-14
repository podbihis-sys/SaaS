import { redirect } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { AuthShell } from "@/components/auth-shell";
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
    <AuthShell title="Ihre Testphase ist beendet">
      <div className="card text-center shadow-xl shadow-blue-950/5">
        <p className="text-sm text-slate-600">
          Ihre Geräte, Fristen und Prüfnachweise bleiben gespeichert. Mit dem Abo (49 € netto/Monat,
          monatlich kündbar) arbeiten Sie ohne Unterbrechung weiter — inklusive automatischer
          Erinnerungen und Prüfbericht-Export.
        </p>
        <form action="/api/stripe/checkout" method="post" className="mt-6">
          <button type="submit" className="btn-primary w-full">Jetzt Abo starten — 49 €/Monat netto</button>
        </form>
        {company.stripe_customer_id ? (
          <form action="/api/stripe/portal" method="post" className="mt-3">
            <button type="submit" className="btn-secondary w-full">Rechnungen & Abo verwalten</button>
          </form>
        ) : null}
        <form action={logout} className="mt-6">
          <button type="submit" className="text-sm text-slate-500 underline hover:text-slate-700">Abmelden</button>
        </form>
      </div>
    </AuthShell>
  );
}
