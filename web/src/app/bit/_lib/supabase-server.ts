import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-Supabase-Client für die EIGENE BIT-Instanz (Projekt „bit-gmbh"),
 * getrennt von der SaaS-/pruefpilot-Datenbank. Nutzt eigene Env-Variablen;
 * die Auth-Cookies sind dank projekt-spezifischem Namen automatisch isoliert.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_BIT_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_BIT_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // aus einer Server Component ohne beschreibbaren Cookie-Jar -> ignorieren
          }
        },
      },
    },
  );
}
