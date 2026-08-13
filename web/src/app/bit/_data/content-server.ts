import { createPublicClient } from "@/app/bit/_lib/supabase-public";
import { withTimeout } from "@/app/bit/_lib/with-timeout";
import type { ContentMap } from "./content";

/**
 * Lädt alle Inhalts-Key/Values der BIT-Instanz (Fallback: leeres Objekt – dann
 * greifen die im Code hinterlegten Texte). Die Abfrage hat ein Zeitlimit, damit
 * eine langsame Datenbank das Rendern der Seite nicht blockiert.
 */
export async function getContent(): Promise<ContentMap> {
  return withTimeout<ContentMap>(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("bit_content").select("key,value");
    if (error || !data) return {};
    const map: ContentMap = {};
    for (const row of data as { key: string; value: string | null }[]) {
      if (row.value != null) map[row.key] = row.value;
    }
    return map;
  }, {});
}
