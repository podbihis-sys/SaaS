import "server-only";
import path from "node:path";

/**
 * Lokaler Datei-Upload (ersetzt den Supabase-Storage-Bucket
 * "bit-product-images"). Dateien liegen unter BIT_UPLOAD_DIR mit derselben
 * relativen Key-Konvention wie zuvor: products/…, news/…, categories/….
 */

/** Wurzelverzeichnis der Uploads (default: .bit-uploads neben dem Projekt). */
export function uploadDir(): string {
  const dir = process.env.BIT_UPLOAD_DIR;
  if (dir && dir.trim()) return path.resolve(dir.trim());
  return path.resolve(process.cwd(), ".bit-uploads");
}

/** Erlaubte Unterordner (= Key-Praefixe). */
const ALLOWED_PREFIXES = ["products", "news", "categories"];

/**
 * Prueft einen relativen Key und loest ihn gegen das Upload-Verzeichnis auf.
 * Verhindert Verzeichnis-Ausbrueche (..) und fremde Praefixe. Liefert null,
 * wenn der Key unzulaessig ist.
 */
export function resolveKey(key: string): string | null {
  const clean = key.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!clean || clean.includes("..")) return null;
  const prefix = clean.split("/")[0] ?? "";
  if (!ALLOWED_PREFIXES.includes(prefix)) return null;
  const root = uploadDir();
  const abs = path.resolve(root, clean);
  // abs muss innerhalb von root bleiben.
  if (abs !== root && !abs.startsWith(root + path.sep)) return null;
  return abs;
}

/** Ordner (products/news/categories) auf Gueltigkeit pruefen. */
export function isAllowedFolder(folder: string): boolean {
  return ALLOWED_PREFIXES.includes(folder);
}

/** Simple Content-Type-Ableitung aus der Dateiendung fuer die Media-Route. */
export function contentTypeFor(file: string): string {
  const ext = path.extname(file).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}
