/**
 * Client-Helfer fuer Bild-Uploads und Bild-URLs (ersetzt Supabase Storage).
 * Keine Server-Imports – wird in den Admin-Formularen genutzt.
 */

/** Relative Keys ueber die Media-Route; http/absolute Pfade unveraendert. */
export function mediaUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/bit/media/${path}`;
}

/**
 * Laedt eine Datei ueber /bit/api/upload hoch und liefert den gespeicherten
 * relativen Key. Wirft bei Fehler (Aufrufer faengt ab).
 */
export async function uploadImage(
  file: File,
  folder: "products" | "news" | "categories",
  base: string,
): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", folder);
  body.append("base", base);
  const res = await fetch("/bit/api/upload", { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
  if (!res.ok || !json.path) {
    throw new Error(json.error || `Upload fehlgeschlagen (${res.status}).`);
  }
  return json.path;
}
