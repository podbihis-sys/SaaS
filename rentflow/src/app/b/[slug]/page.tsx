import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import { shouldShowBranding } from "@/lib/entitlements";
import { BookingWidget, type WidgetItem } from "@/components/booking-widget";

export const dynamic = "force-dynamic";

/**
 * Public booking page for a tenant (prompt §8/§5). Reads through the service
 * role (NOT the anon role) scoped tightly to the slug, so RLS-protected data of
 * other tenants is never exposed.
 */
async function loadTenant(slug: string) {
  const supabase = createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "user_id, company_name, slug, connect_charges_enabled, plan, plan_status, branding_enabled",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!profile) return null;

  const { data: items } = await supabase
    .from("items")
    .select("id, name, description, price_per_day, deposit_amount, quantity")
    .eq("user_id", profile.user_id)
    .eq("active", true)
    .order("created_at", { ascending: true });

  return { profile, items: (items ?? []) as WidgetItem[] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadTenant(slug);
  const name = data?.profile.company_name ?? "Verleih";
  return {
    title: `${name} — Online buchen`,
    description: `Verfügbarkeit prüfen und direkt online buchen bei ${name}.`,
  };
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { slug } = await params;
  const { status } = await searchParams;
  const data = await loadTenant(slug);
  if (!data) notFound();

  const { profile, items } = data;
  const showBranding = shouldShowBranding(profile);

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold">{profile.company_name ?? "Verleih"}</h1>
      <p className="mt-1 text-muted-foreground">Verfügbarkeit prüfen und direkt online buchen.</p>

      {status === "success" ? (
        <div className="mt-6 rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-800">
          Vielen Dank! Deine Buchung ist eingegangen und wird per E-Mail bestätigt.
        </div>
      ) : null}
      {status === "cancelled" ? (
        <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Die Zahlung wurde abgebrochen. Du kannst es erneut versuchen.
        </div>
      ) : null}

      <div className="mt-8">
        {profile.connect_charges_enabled ? (
          <BookingWidget slug={profile.slug ?? slug} items={items} />
        ) : (
          <div className="rounded-md border p-5 text-muted-foreground">
            Dieser Betrieb richtet die Online-Buchung gerade ein und ist in Kürze buchbar.
          </div>
        )}
      </div>

      {showBranding ? (
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Buchung by{" "}
          <a href={process.env.NEXT_PUBLIC_APP_URL ?? "/"} className="underline">
            RentFlow
          </a>
        </p>
      ) : null}
    </main>
  );
}
