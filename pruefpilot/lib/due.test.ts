import { describe, expect, it } from "vitest";
import { daysUntil, dueInfo, dueStatus, nextDueFrom } from "./due";

const TODAY = "2026-06-12";

describe("daysUntil", () => {
  it.each([
    ["2026-06-12", 0],
    ["2026-06-13", 1],
    ["2026-06-11", -1],
    ["2026-07-12", 30],
    ["2027-06-12", 365],
    ["2026-01-01", -162],
  ])("(%s) → %i Tage", (date, expected) => {
    expect(daysUntil(date, TODAY)).toBe(expected);
  });

  it("wirft bei ungültigem Format", () => {
    expect(() => daysUntil("12.06.2026", TODAY)).toThrow("JJJJ-MM-TT");
    expect(() => daysUntil("2026-06-12", "heute")).toThrow("JJJJ-MM-TT");
  });

  it("wirft bei nicht existierendem Kalendertag", () => {
    expect(() => daysUntil("2026-02-30", TODAY)).toThrow("Kein gültiger Kalendertag");
  });
});

describe("dueStatus", () => {
  it.each([
    ["2026-06-11", "overdue"],
    ["2025-01-01", "overdue"],
    ["2026-06-12", "due_30"],
    ["2026-07-12", "due_30"],
    ["2026-07-13", "due_60"],
    ["2026-08-11", "due_60"],
    ["2026-08-12", "ok"],
    ["2030-01-01", "ok"],
  ])("(%s) → %s", (date, expected) => {
    expect(dueStatus(date, TODAY)).toBe(expected);
  });
});

describe("dueInfo", () => {
  it("liefert Status und Resttage zusammen", () => {
    expect(dueInfo("2026-06-05", TODAY)).toEqual({ status: "overdue", daysLeft: -7 });
  });
});

describe("nextDueFrom", () => {
  it.each([
    ["2026-01-15", 12, "2027-01-15"],
    ["2026-06-12", 24, "2028-06-12"],
    ["2026-01-31", 1, "2026-02-28"],
    ["2024-01-31", 1, "2024-02-29"],
    ["2026-11-30", 3, "2027-02-28"],
    ["2026-08-31", 1, "2026-09-30"],
    ["2026-12-31", 2, "2027-02-28"],
    ["2026-10-31", 48, "2030-10-31"],
  ])("(%s + %i Monate) → %s", (start, months, expected) => {
    expect(nextDueFrom(start, months)).toBe(expected);
  });

  it("wirft bei ungültigem Intervall", () => {
    expect(() => nextDueFrom("2026-01-01", 0)).toThrow("Intervall");
    expect(() => nextDueFrom("2026-01-01", 121)).toThrow("Intervall");
    expect(() => nextDueFrom("2026-01-01", 1.5)).toThrow("Intervall");
  });

  it("wirft bei ungültigem Startdatum", () => {
    expect(() => nextDueFrom("2026-02-30", 1)).toThrow("Kein gültiger Kalendertag");
  });
});
