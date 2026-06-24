"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { companySchema } from "@/lib/zod-schemas";

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

export async function updateCompany(
  _previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const user = await getUser();
  if (!user) {
    return { error: "Nicht angemeldet." };
  }

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    contactEmail: formData.get("contactEmail"),
    bundesland: formData.get("bundesland"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Eingaben prüfen" };
  }

  const supabase = await createClient();
  // RLS (companies_update) beschränkt zusätzlich auf den Eigentümer.
  const { error } = await supabase
    .from("companies")
    .update({
      name: parsed.data.name,
      contact_email: parsed.data.contactEmail,
      bundesland: parsed.data.bundesland,
    })
    .eq("owner_id", user.id);

  if (error) {
    return { error: "Speichern fehlgeschlagen. Bitte erneut versuchen." };
  }

  revalidatePath("/einstellungen");
  revalidatePath("/dashboard");
  return { success: true };
}
