import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSessionAdmin } from "@/app/bit/_lib/auth";
import { uploadDir, isAllowedFolder } from "@/app/bit/_lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Admin-only Upload (ersetzt storage.upload). POST multipart/form-data mit
 * Feldern: file (Datei), folder (products|news|categories), base (Dateiname
 * ohne Endung). Schreibt unter BIT_UPLOAD_DIR und liefert { path } mit dem
 * relativen Key zurueck (wie zuvor bei Supabase).
 */
export async function POST(request: Request) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "products");
  const base = String(form.get("base") ?? "datei").slice(0, 60) || "datei";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei." }, { status: 400 });
  }
  if (!isAllowedFolder(folder)) {
    return NextResponse.json({ error: "Ungültiger Ordner." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const safeBase = base.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/(^-|-$)/g, "") || "datei";
  const key = `${folder}/${safeBase}-${Date.now()}.${ext}`;

  try {
    const abs = path.resolve(uploadDir(), key);
    await mkdir(path.dirname(abs), { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(abs, buf);
  } catch (e) {
    return NextResponse.json(
      { error: `Speichern fehlgeschlagen: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ path: key });
}
