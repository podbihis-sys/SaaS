import { createClient } from "@/app/bit/_lib/supabase-server";
import type { ContentMap } from "./content";

/** Lädt alle Inhalts-Key/Values der BIT-Instanz (Fallback: leeres Objekt). */
export async function getContent(): Promise<ContentMap> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("bit_content").select("key,value");
    if (error || !data) return {};
    const map: ContentMap = {};
    for (const row of data as { key: string; value: string | null }[]) {
      if (row.value != null) map[row.key] = row.value;
    }
    return map;
  } catch {
    return {};
  }
}
