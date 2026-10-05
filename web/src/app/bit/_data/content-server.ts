import { query } from "@/app/bit/_lib/db";
import { withTimeout } from "@/app/bit/_lib/with-timeout";
import type { ContentMap } from "./content";

/**
 * Lädt alle Inhalts-Key/Values der BIT-Instanz aus `bit_content` (MariaDB).
 * Fallback: leeres Objekt – dann greifen die im Code hinterlegten Texte. Die
 * Abfrage hat ein Zeitlimit, damit eine langsame Datenbank das Rendern nicht
 * blockiert. bit_content hat keinen Status (immer oeffentlich lesbar).
 */
export async function getContent(): Promise<ContentMap> {
  return withTimeout<ContentMap>(async () => {
    const rows = await query<{ key: string; value: string | null }>(
      "SELECT `key`,`value` FROM bit_content",
    );
    const map: ContentMap = {};
    for (const row of rows) {
      if (row.value != null) map[row.key] = row.value;
    }
    return map;
  }, {});
}
