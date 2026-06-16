import { getCurrentProfile } from "@/lib/supabase/server";
import { getEntitlements } from "@/lib/entitlements";
import { ConnectButton, SubscribeButtons, PortalButton } from "@/components/billing-actions";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const profile = await getCurrentProfile();
  const ent = getEntitlements(profile);
  const connectReady = profile?.connect_charges_enabled;
  const hasSubscription = !!profile?.stripe_customer_id;

  return (
    <div className="max-w-2xl space-y-10">
      <h1 className="text-2xl font-bold">Abrechnung & Zahlungen</h1>

      <section className="space-y-3">
        <h2 className="font-semibold">Stripe Connect (Mieter-Zahlungen)</h2>
        <p className="text-sm text-muted-foreground">
          Anzahlung und Kaution gehen per Stripe <strong>direkt auf dein eigenes Konto</strong>.
          RentFlow ist nie im Geldfluss. Deine Buchungsseite wird live, sobald Stripe Zahlungen
          freigibt.
        </p>
        <p className="text-sm">
          Status:{" "}
          {connectReady ? (
            <span className="font-medium text-green-700">aktiv — Zahlungen möglich</span>
          ) : (
            <span className="font-medium text-amber-700">noch nicht abgeschlossen</span>
          )}
        </p>
        <ConnectButton done={!!profile?.stripe_connect_account_id} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Plattform-Abo (RentFlow)</h2>
        <p className="text-sm">
          Aktueller Tarif: <strong>{ent.plan.toUpperCase()}</strong>
          {profile?.plan_status ? ` (${profile.plan_status})` : ""}
        </p>
        {hasSubscription ? <PortalButton /> : <SubscribeButtons />}
      </section>
    </div>
  );
}
