"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-Supabase-Client für die EIGENE BIT-Instanz (Projekt „bit-gmbh"),
 * getrennt von der SaaS-/pruefpilot-Datenbank.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_BIT_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_BIT_SUPABASE_ANON_KEY ?? "",
  );
}
