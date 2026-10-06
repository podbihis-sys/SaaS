import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { resolveKey, contentTypeFor } from "@/app/bit/_lib/uploads";

export const runtime = "nodejs";

/**
 * Liefert hochgeladene Dateien aus BIT_UPLOAD_DIR aus (ersetzt die oeffentliche
 * Supabase-Storage-URL). Alternativ koennen die Dateien direkt vom Webserver
 * ausgeliefert werden (siehe docs/bit-plesk-deploy.md) – dann greift diese
 * Route nur noch als Fallback.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const key = (segments ?? []).join("/");
  const abs = resolveKey(key);
  if (!abs) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const info = await stat(abs);
    if (!info.isFile()) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = await readFile(abs);
    return new NextResponse(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": contentTypeFor(abs),
        "Content-Length": String(info.size),
        // Bilder sind durch den Zeitstempel im Dateinamen unveraenderlich.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
