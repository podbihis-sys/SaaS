"use server";

import { signIn, clearSession } from "@/app/bit/_lib/auth";

/** Login-Action fuer die Anmeldeseite (ruft die eigene Auth-Logik). */
export async function loginAction(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    return await signIn(email, password);
  } catch (e) {
    // z. B. fehlendes BIT_AUTH_SECRET oder DB nicht erreichbar.
    return { ok: false, error: e instanceof Error ? e.message : "Anmeldung fehlgeschlagen." };
  }
}

/** Logout-Action (Panel-Layout). */
export async function logoutAction(): Promise<void> {
  await clearSession();
}
