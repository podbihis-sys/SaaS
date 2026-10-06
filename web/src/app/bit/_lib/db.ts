import "server-only";
import mysql from "mysql2/promise";

/**
 * MariaDB-Verbindungspool fuer die BIT-Website (self-hosted, ohne Supabase).
 *
 * Singleton: der Pool wird erst beim ersten Query erzeugt, NICHT beim Import.
 * So laeuft der Build (next build) ohne erreichbare Datenbank durch – die
 * oeffentlichen Seiten fallen ueber withTimeout() auf ihre statischen Inhalte
 * zurueck, wenn keine DB da ist.
 *
 * Konfiguration ueber BIT_DB_* (mit Fallback auf die generischen DB_*):
 *   BIT_DB_HOST / DB_HOST            (default 127.0.0.1)
 *   BIT_DB_PORT / DB_PORT            (default 3306)
 *   BIT_DB_USER / DB_USER
 *   BIT_DB_PASSWORD / DB_PASSWORD
 *   BIT_DB_NAME / DB_NAME
 */

let pool: mysql.Pool | undefined;

function env(name: string, fallback?: string): string | undefined {
  return process.env[`BIT_${name}`] ?? process.env[name] ?? fallback;
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env("DB_HOST", "127.0.0.1"),
      port: Number(env("DB_PORT", "3306")),
      user: env("DB_USER"),
      password: env("DB_PASSWORD"),
      database: env("DB_NAME"),
      waitForConnections: true,
      connectionLimit: Number(env("DB_POOL", "10")),
      // Datums-/JSON-Spalten als Strings bzw. geparste Objekte liefern.
      dateStrings: true,
      charset: "utf8mb4",
      // Erlaubt mehrere Statements fuer Wartungsskripte; Queries hier sind
      // parametrisiert, daher kein Injection-Risiko.
      multipleStatements: false,
    });
  }
  return pool;
}

/** Mehrere Zeilen. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}

/** Erste Zeile oder undefined. */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | undefined> {
  const rows = await query<T>(sql, params);
  return rows[0];
}

/** Schreibende Anweisung (INSERT/UPDATE/DELETE); liefert das ResultSetHeader. */
export async function execute(
  sql: string,
  params: unknown[] = [],
): Promise<mysql.ResultSetHeader> {
  // .query() statt .execute(): akzeptiert die breiteren Parametertypen (JSON-
  // Strings etc.) und escaped serverseitig – fuer unsere Zwecke gleichwertig.
  const [res] = await getPool().query(sql, params);
  return res as mysql.ResultSetHeader;
}

/**
 * JSON-Spalte robust auslesen. mysql2 liefert JSON-Spalten je nach Treiber als
 * bereits geparstes Objekt ODER als String – beides wird hier abgefangen.
 */
export function parseJsonColumn<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}
