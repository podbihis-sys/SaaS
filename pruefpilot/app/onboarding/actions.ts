"use server";

import { redirect } from "next/navigation";
import { getUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { companySchema } from "@/lib/zod-schemas";

export interface OnboardingFormState {
  error?: string;
}

export async function createCompany(
  _previous: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    contactEmail: formData.get("contactEmail"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Eingaben prüfen" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("companies").insert({
    owner_id: user.id,
    name: parsed.data.name,
    contact_email: parsed.data.contactEmail,
  });

  // 23505 = unique_violation: Betrieb existiert bereits (Doppel-Submit) → einfach weiterleiten.
  if (error && error.code !== "23505") {
    return { error: "Betrieb konnte nicht angelegt werden. Bitte erneut versuchen." };
  }

  redirect("/dashboard");
}
