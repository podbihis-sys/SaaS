import { describe, expect, it } from "vitest";
import { renderAuditPdf, type AuditReportData } from "./audit-report";
import type { DeviceRow, InspectionRow } from "./types";

function device(overrides: Partial<DeviceRow>): DeviceRow {
  return {
    id: "d1",
    company_id: "c1",
    category_id: "dguv_v3_portable",
    name: "Bohrmaschine",
    location: "Halle 2",
    serial_number: null,
    interval_months: 12,
    next_due_date: "2026-07-01",
    status: "active",
    public_code: "TESTCODE",
    notes: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const inspection: InspectionRow = {
  id: "i1",
  device_id: "d1",
  company_id: "c1",
  inspected_at: "2025-07-01",
  inspector_name: "Max Prüfer",
  result: "passed",
  comment: null,
  document_path: "c1/d1/nachweis.pdf",
  created_at: "2025-07-01T10:00:00Z",
};

describe("renderAuditPdf", () => {
  it("erzeugt ein gültiges PDF mit Geräten und Nachweisen", async () => {
    const data: AuditReportData = {
      companyName: "Muster GmbH",
      generatedAt: "12.06.2026, 10:00",
      today: "2026-06-12",
      devices: [
        device({ id: "d1" }),
        device({ id: "d2", name: "Leiter Lager", category_id: "ladder", next_due_date: "2026-05-01" }),
      ],
      latestInspectionByDevice: new Map([["d1", inspection]]),
      evidenceCount: 1,
    };
    const buffer = await renderAuditPdf(data);
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("bricht große Kategorien über mehrere Seiten um statt abzuschneiden", async () => {
    const many = Array.from({ length: 40 }, (_, i) =>
      device({ id: `d${i}`, name: `Feuerlöscher ${i + 1}`, category_id: "fire_extinguisher" }),
    );
    const buffer = await renderAuditPdf({
      companyName: "Groß GmbH",
      generatedAt: "12.06.2026, 10:00",
      today: "2026-06-12",
      devices: many,
      latestInspectionByDevice: new Map(),
      evidenceCount: 0,
    });
    const pageCount = (buffer.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(pageCount).toBeGreaterThan(1);
    // Textinhalte sind komprimiert — Wachstum gegenüber 5 Geräten belegt,
    // dass alle Zeilen gerendert werden (kein stilles Clipping).
    const small = await renderAuditPdf({
      companyName: "Groß GmbH",
      generatedAt: "12.06.2026, 10:00",
      today: "2026-06-12",
      devices: many.slice(0, 5),
      latestInspectionByDevice: new Map(),
      evidenceCount: 0,
    });
    expect(buffer.length).toBeGreaterThan(small.length * 1.5);
  });

  it("rendert auch ohne Geräte (leerer Betrieb)", async () => {
    const buffer = await renderAuditPdf({
      companyName: "Leer GmbH",
      generatedAt: "12.06.2026, 10:00",
      today: "2026-06-12",
      devices: [],
      latestInspectionByDevice: new Map(),
      evidenceCount: 0,
    });
    expect(buffer.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });
});
