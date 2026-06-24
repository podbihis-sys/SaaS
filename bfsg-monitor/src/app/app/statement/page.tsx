import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DISCLAIMERS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

import { generateStatement } from "./actions";

export const metadata: Metadata = { title: "Erklärung zur Barrierefreiheit" };

export default async function StatementPage({
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

  const { data: domains } = await supabase
    .from("domains")
    .select("id, url, label")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const { data: statements } = await supabase
    .from("accessibility_statements")
    .select("id, company_name, conformance_text, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Erklärung zur Barrierefreiheit</h1>
        <p className="text-muted-foreground">
          Generiere einen Entwurf auf Basis deines letzten Scans.
        </p>
      </header>

      {error === "fields" && (
        <p className="rounded-md bg-muted p-3 text-sm text-destructive">
          Bitte Firmenname und Kontakt-E-Mail angeben.
        </p>
      )}
      {error === "save" && (
        <p className="rounded-md bg-muted p-3 text-sm text-destructive">
          Speichern fehlgeschlagen. Bitte erneut versuchen.
        </p>
      )}

      <form action={generateStatement} className="space-y-4 rounded-lg border p-5">
        <div className="space-y-2">
          <Label htmlFor="domain_id">Domain (optional)</Label>
          <select
            id="domain_id"
            name="domain_id"
            className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
          >
            <option value="">— ohne Domain —</option>
            {domains?.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.label || domain.url}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_name">Firmenname</Label>
          <Input id="company_name" name="company_name" required placeholder="Muster GmbH" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_email">Kontakt-E-Mail</Label>
          <Input id="contact_email" name="contact_email" type="email" required placeholder="barrierefreiheit@firma.de" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="known_limitations">Bekannte Einschränkungen (optional)</Label>
          <textarea
            id="known_limitations"
            name="known_limitations"
            rows={4}
            className="w-full rounded-md border bg-transparent p-3 text-sm"
            placeholder="z. B. einzelne PDF-Dokumente sind noch nicht barrierefrei."
          />
        </div>
        <Button type="submit">Erklärung erstellen</Button>
      </form>

      <section className="space-y-2">
        <h2 className="font-semibold">Erstellte Erklärungen</h2>
        <ul className="divide-y rounded-lg border">
          {statements && statements.length > 0 ? (
            statements.map((statement) => (
              <li key={statement.id} className="flex items-center justify-between p-3 text-sm">
                <span>
                  <Link href={`/app/statement/${statement.id}`} className="font-medium hover:underline">
                    {statement.company_name || "Erklärung"}
                  </Link>
                  <span className="ml-2 text-muted-foreground">
                    {statement.conformance_text} ·{" "}
                    {new Date(statement.created_at).toLocaleDateString("de-DE")}
                  </span>
                </span>
                <Link href={`/app/statement/${statement.id}`} className="underline">
                  Ansehen
                </Link>
              </li>
            ))
          ) : (
            <li className="p-6 text-center text-sm text-muted-foreground">
              Noch keine Erklärung erstellt.
            </li>
          )}
        </ul>
      </section>

      <p className="text-xs text-muted-foreground">{DISCLAIMERS.noLegalAdvice}</p>
    </div>
  );
}
