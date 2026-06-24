"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildStatementHtml, conformanceFromScore } from "@/lib/statement";
import { createClient } from "@/lib/supabase/server";

export async function generateStatement(formData: FormData): Promise<void> {
  const companyName = String(formData.get("company_name") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();
  const knownLimitations = String(formData.get("known_limitations") ?? "").trim();
  const domainId = String(formData.get("domain_id") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!companyName || !contactEmail) redirect("/app/statement?error=fields");

  let url = "Ihre Website";
  let score: number | null = null;
  if (domainId) {
    const { data: domain } = await supabase
      .from("domains")
      .select("id, url")
      .eq("id", domainId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (domain) {
      url = domain.url;
      const { data: scans } = await supabase
        .from("scans")
        .select("score")
        .eq("domain_id", domain.id)
        .order("created_at", { ascending: false })
        .limit(1);
      score = scans?.[0]?.score ?? null;
    }
  }

  const conformance = conformanceFromScore(score);
  const html = buildStatementHtml({
    companyName,
    contactEmail,
    url,
    knownLimitations,
    conformance,
  });

  const { data, error } = await supabase
    .from("accessibility_statements")
    .insert({
      user_id: user.id,
      domain_id: domainId,
      company_name: companyName,
      contact_email: contactEmail,
      conformance_text: conformance,
      known_limitations: knownLimitations || null,
      generated_html: html,
    })
    .select("id")
    .single();

  if (error || !data) redirect("/app/statement?error=save");
  revalidatePath("/app/statement");
  redirect(`/app/statement/${data.id}`);
}
