import { describe, expect, it } from "vitest";
import { verdictFor, type VerificationPayload } from "./verification";

const TODAY = "2026-06-15";
function p(o: Partial<VerificationPayload>): VerificationPayload {
  return {
    name: "Bohrmaschine",
    category_id: "dguv_v3_portable",
    status: "active",
    next_due_date: "2026-12-01",
    last_inspected_at: "2025-12-01",
    last_result: "passed",
    last_inspector: "Max Prüfer",
    ...o,
  };
}

describe("verdictFor", () => {
  it("gültig: bestanden und Frist in der Zukunft", () => {
    expect(verdictFor(p({}), TODAY)).toBe("valid");
  });
  it("gültig am Stichtag selbst", () => {
    expect(verdictFor(p({ next_due_date: TODAY }), TODAY)).toBe("valid");
  });
  it("abgelaufen: Frist überschritten", () => {
    expect(verdictFor(p({ next_due_date: "2026-06-14" }), TODAY)).toBe("expired");
  });
  it("abgelaufen schlägt mit Mängeln (passed_with_defects) durch", () => {
    expect(verdictFor(p({ last_result: "passed_with_defects", next_due_date: "2026-01-01" }), TODAY)).toBe("expired");
  });
  it("nicht bestanden hat Vorrang vor Frist", () => {
    expect(verdictFor(p({ last_result: "failed", next_due_date: "2030-01-01" }), TODAY)).toBe("failed");
  });
  it("keine Prüfung dokumentiert", () => {
    expect(verdictFor(p({ last_inspected_at: null, last_result: null }), TODAY)).toBe("none");
  });
  it("stillgelegt vor allem anderen", () => {
    expect(verdictFor(p({ status: "retired", last_result: "failed" }), TODAY)).toBe("retired");
  });
});
