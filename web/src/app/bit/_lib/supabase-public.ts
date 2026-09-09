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
        // Next.js legt fetch-Antworten sonst dauerhaft im Data Cache ab und
        // friert die CMS-Inhalte auf dem Build-Stand ein (die ISR-Regeneration
        // lief, bekam aber immer die gecachte Antwort). next.revalidate haelt
        // den Data Cache im selben 5-Minuten-Takt frisch wie die Seiten –
        // no-store waere falsch, es machte die Seiten komplett dynamisch.
        fetch: (input, init) =>
          fetch(input, { ...init, next: { revalidate: 300 } } as RequestInit),
      },
    },
  );
}
