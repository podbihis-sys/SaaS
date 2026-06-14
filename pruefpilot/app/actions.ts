"use server";

import { createClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/zod-schemas";

export interface LeadFormState {
  error?: string;
  success?: boolean;
}

export async function submitLead(
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  // Honeypot: Bots füllen das versteckte Feld — still als Erfolg abspeisen.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot !== "") {
    return { success: true };
  }

  const parsed = leadSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    companySize: formData.get("companySize"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Eingaben prüfen" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    email: parsed.data.email,
    name: parsed.data.name ?? null,
    company_size: parsed.data.companySize,
  });

  // 23505 = bereits vorgemerkt: ebenfalls Erfolg melden (keine E-Mail-Enumeration).
  if (error && error.code !== "23505") {
    return { error: "Vormerkung fehlgeschlagen. Bitte versuchen Sie es erneut." };
  }
  return { success: true };
}
