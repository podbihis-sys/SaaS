import Link from "next/link";
import { createServerSupabase, getCurrentProfile } from "@/lib/supabase/server";
import { getEntitlements } from "@/lib/entitlements";
import { todayInBerlin } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  const supabase = await createServerSupabase();
  const today = todayInBerlin();

  const [{ count: itemCount }, { count: upcomingCount }, { data: recent }] = await Promise.all([
    supabase.from("items").select("id", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["confirmed", "active"])
      .gte("end_date", today),
    supabase
      .from("bookings")
      .select("id, customer_name, start_date, end_date, status")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const ent = getEntitlements(profile);
  const connectReady = profile?.connect_charges_enabled;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">{profile?.company_name ?? "Dein Betrieb"}</p>
      </div>

      {!connectReady ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Deine Buchungsseite ist noch nicht live. Schließe das{" "}
          <Link href="/app/billing" className="font-medium underline">
            Stripe-Connect-Onboarding
          </Link>{" "}
          ab, um Zahlungen zu empfangen.
        </div>
      ) : (
        <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-900">
          Buchungsseite ist live:{" "}
          <Link href={`/b/${profile?.slug}`} className="font-medium underline">
            /b/{profile?.slug}
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Artikel" value={`${itemCount ?? 0}${ent.maxItems ? ` / ${ent.maxItems}` : ""}`} />
        <Stat label="Laufende/kommende Buchungen" value={`${upcomingCount ?? 0}`} />
        <Stat label="Tarif" value={ent.plan.toUpperCase()} />
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Letzte Buchungen</h2>
        {recent && recent.length > 0 ? (
          <ul className="divide-y rounded-md border">
            {recent.map((b) => (
              <li key={b.id} className="flex justify-between px-4 py-2 text-sm">
                <span>{b.customer_name ?? "—"}</span>
                <span className="text-muted-foreground">
                  {b.start_date} – {b.end_date} · {b.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Noch keine Buchungen.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
