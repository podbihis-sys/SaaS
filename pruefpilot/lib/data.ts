import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { CompanyRow } from "@/lib/types";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCompany = cache(async (): Promise<CompanyRow | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("companies").select("*").maybeSingle();
  if (error) {
    throw new Error(`Betrieb konnte nicht geladen werden: ${error.message}`);
  }
  return data;
});
