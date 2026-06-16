import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Erklärung" };

export default async function StatementViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: statement } = await supabase
    .from("accessibility_statements")
    .select("id, generated_html")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!statement?.generated_html) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="text-sm text-muted-foreground">
        Tipp: Über „Drucken → Als PDF speichern“ erhältst du eine PDF-Fassung.
      </p>
      <article
        className="prose-bfsg space-y-3 rounded-lg border bg-card p-6 [&_a]:underline [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:font-semibold"
        // Content is generated server-side from sanitised inputs.
        dangerouslySetInnerHTML={{ __html: statement.generated_html }}
      />
    </div>
  );
}
