import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEntitlements } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

import { addDomain, deleteDomain } from "./actions";

export const metadata: Metadata = { title: "Domains" };

export default async function DomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_status")
    .eq("user_id", user.id)
    .single();
  const { data: domains } = await supabase
    .from("domains")
    .select("id, url, label, monitoring_enabled")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const limit = getEntitlements(profile).maxDomains;
  const used = domains?.length ?? 0;
  const atLimit = used >= limit;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Domains</h1>
        <p className="text-muted-foreground">
          {used} von {limit} Domain(s) genutzt.
        </p>
      </header>

      {error === "limit" && (
        <p className="rounded-md bg-muted p-3 text-sm">
          Domain-Limit erreicht. Upgrade für mehr Domains unter{" "}
          <Link href="/app/billing" className="underline">
            Abo & Rechnung
          </Link>
          .
        </p>
      )}
      {error === "url" && (
        <p className="rounded-md bg-muted p-3 text-sm text-destructive">
          Bitte eine gültige URL eingeben.
        </p>
      )}

      {!atLimit && (
        <form action={addDomain} className="flex flex-col gap-2 sm:flex-row">
          <Input name="url" type="text" required placeholder="https://ihre-firma.de" aria-label="Domain-URL" />
          <Input name="label" type="text" placeholder="Bezeichnung (optional)" aria-label="Bezeichnung" />
          <Button type="submit">Hinzufügen</Button>
        </form>
      )}

      <ul className="divide-y rounded-lg border">
        {domains && domains.length > 0 ? (
          domains.map((domain) => (
            <li key={domain.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <Link href={`/app/domains/${domain.id}`} className="font-medium hover:underline">
                  {domain.label || domain.url}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{domain.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/app/domains/${domain.id}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Details
                </Link>
                <form action={deleteDomain}>
                  <input type="hidden" name="id" value={domain.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Entfernen
                  </Button>
                </form>
              </div>
            </li>
          ))
        ) : (
          <li className="p-6 text-center text-sm text-muted-foreground">
            Noch keine Domain hinzugefügt.
          </li>
        )}
      </ul>
    </div>
  );
}
