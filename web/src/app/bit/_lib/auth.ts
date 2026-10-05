import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { queryOne, execute } from "./db";

/**
 * Eigene Admin-Authentifizierung fuer das BIT-CMS (ersetzt Supabase Auth).
 *
 * Ablauf: E-Mail + Passwort gegen bit_admins.password_hash (bcrypt) pruefen,
 * bei Erfolg ein mit jose signiertes JWT in einem HttpOnly-Cookie ablegen.
 * getSessionAdmin() liest das Cookie, prueft die Signatur und laedt die
 * zugehoerige Admin-Zeile – eine gueltige Zeile IST die Freischaltung.
 */

const COOKIE = "bit_admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 Tage

export interface SessionAdmin {
  id: string;
  email: string;
  role: "admin" | "editor";
}

interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
  role: "admin" | "editor";
}

function secret(): Uint8Array {
  const value = process.env.BIT_AUTH_SECRET;
  if (!value) {
    // Kein Fallback mit Default-Secret: Fehlt die Variable, ist Login bewusst
    // nicht moeglich (statt mit einem vorhersagbaren Schluessel zu signieren).
    throw new Error("BIT_AUTH_SECRET ist nicht gesetzt.");
  }
  return new TextEncoder().encode(value);
}

/** Login: prueft Zugangsdaten und setzt das Session-Cookie. */
export async function signIn(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await queryOne<AdminRow>(
    "SELECT id, email, password_hash, role FROM bit_admins WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()],
  );
  // Gleiche Fehlermeldung bei unbekannter E-Mail und falschem Passwort,
  // damit keine Konten durchprobiert werden koennen.
  const invalid = { ok: false, error: "E-Mail oder Passwort falsch." } as const;
  if (!row) return invalid;
  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) return invalid;

  const token = await new SignJWT({ email: row.email, role: row.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(row.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return { ok: true };
}

/** Liest + verifiziert das Cookie und laedt die aktuelle Admin-Zeile. */
export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = payload.sub;
    if (!id) return null;
    const row = await queryOne<AdminRow>(
      "SELECT id, email, role FROM bit_admins WHERE id = ? LIMIT 1",
      [id],
    );
    if (!row) return null; // Konto entfernt -> keine Freischaltung mehr
    return { id: row.id, email: row.email, role: row.role };
  } catch {
    return null; // abgelaufen, manipuliert oder DB nicht erreichbar
  }
}

/** Logout: Session-Cookie entfernen. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Hilfsfunktion fuer Skripte/Tests: bcrypt-Hash erzeugen. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Setzt/aktualisiert ein Admin-Konto (von create-admin.mjs genutzt). */
export async function upsertAdmin(
  email: string,
  passwordHash: string,
  role: "admin" | "editor" = "admin",
): Promise<void> {
  await execute(
    `INSERT INTO bit_admins (email, password_hash, role)
       VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)`,
    [email.trim().toLowerCase(), passwordHash, role],
  );
}
