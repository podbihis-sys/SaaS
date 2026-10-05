import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-Client für ÖFFENTLICHE Leseanfragen (Seitentexte, News).
 *
 * Ohne Cookie-Anbindung: Sobald eine Seite `cookies()` anfasst, wird sie von
 * Next.js als dynamisch eingestuft und bei jedem Aufruf neu gerendert. Ohne
 * Cookies bleiben diese Seiten statisch vorgerendert und cachebar.
 *
 * Alles, was eine Anmeldung braucht (Admin), läuft über `supabase-server.ts`.
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
