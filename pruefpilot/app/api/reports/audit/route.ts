import { NextResponse } from "next/server";
import { renderAuditPdf } from "@/lib/audit-report";
import { hasAccess } from "@/lib/billing";
import { getCompany } from "@/lib/data";
import { todayIso } from "@/lib/due";
import { createClient } from "@/lib/supabase/server";
import type { DeviceRow, InspectionRow } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const company = await getCompany();
  if (!company) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // API-Routen prüfen den Abo-Zugriff selbst — das Layout-Gate deckt nur Seiten ab.
  if (!hasAccess(company)) {
    return NextResponse.json({ error: "subscription required" }, { status: 402 });
  }

  const supabase = await createClient();
  const [devicesResult, inspectionsResult] = await Promise.all([
    supabase.from("devices").select("*").order("name", { ascending: true }),
    supabase
      .from("inspections")
      .select("*")
      .order("inspected_at", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);
  if (devicesResult.error || inspectionsResult.error) {
    return NextResponse.json({ error: "Bericht konnte nicht erstellt werden" }, { status: 500 });
  }

  const devices = (devicesResult.data ?? []) as DeviceRow[];
  const inspections = (inspectionsResult.data ?? []) as InspectionRow[];

  const latestInspectionByDevice = new Map<string, InspectionRow>();
  let evidenceCount = 0;
  for (const inspection of inspections) {
    if (!latestInspectionByDevice.has(inspection.device_id)) {
      latestInspectionByDevice.set(inspection.device_id, inspection);
    }
    if (inspection.document_path) {
      evidenceCount += 1;
    }
  }

  const today = todayIso();
  const buffer = await renderAuditPdf({
    companyName: company.name,
    generatedAt: new Intl.DateTimeFormat("de-DE", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Berlin",
    }).format(new Date()),
    today,
    devices,
    latestInspectionByDevice,
    evidenceCount,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pruefpilot-bericht-${today}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
