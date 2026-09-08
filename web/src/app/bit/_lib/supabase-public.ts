import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-Client für ÖFFENTLICHE Leseanfragen (Seitentexte, News).
 *
 * Bewusst ohne Cookie-Anbindung: Sobald eine Seite `cookies()` anfasst, stuft
 * Next.js sie als dynamisch ein und rendert sie bei jedem Aufruf neu. Genau das
 * hat Startseite, News und Kontakt auf mehrere Sekunden Antwortzeit gebracht.
 * Ohne Cookies können diese Seiten statisch vorgerendert und aus dem Cache
 * ausgeliefert werden.
 *
 * Für alles, was eine Anmeldung braucht (Admin), bleibt `supabase-server.ts`
 * mit Cookie-Anbindung zuständig.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_BIT_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_BIT_SUPABASE_ANON_KEY ?? "",
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        // Next.js legt fetch-Antworten sonst im Data Cache ab und friert die
        // CMS-Inhalte damit auf dem Build-Stand ein: Die ISR-Regeneration lief,
        // bekam aber immer die gecachte Antwort. no-store erzwingt bei jeder
        // Regeneration einen echten Datenbank-Zugriff; die Seiten selbst
        // bleiben statisch mit revalidate.
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    },
  );
}
