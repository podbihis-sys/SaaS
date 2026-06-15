import { describe, expect, it } from "vitest";
import { isWeekend, isWorkday, lastWorkdayOnOrBefore } from "./workdays";

const NO_HOLIDAYS: ReadonlySet<string> = new Set();

describe("isWeekend", () => {
  it("erkennt Samstag und Sonntag", () => {
    expect(isWeekend("2026-06-20")).toBe(true); // Samstag
    expect(isWeekend("2026-06-21")).toBe(true); // Sonntag
    expect(isWeekend("2026-06-19")).toBe(false); // Freitag
    expect(isWeekend("2026-06-15")).toBe(false); // Montag
  });
});

describe("isWorkday", () => {
  it("Feiertag ist kein Arbeitstag", () => {
    expect(isWorkday("2026-05-01", NO_HOLIDAYS)).toBe(true); // ohne Feiertagsset: Freitag = Arbeitstag
    expect(isWorkday("2026-05-01", new Set(["2026-05-01"]))).toBe(false);
  });
});

describe("lastWorkdayOnOrBefore", () => {
  it("Arbeitstag bleibt unverändert", () => {
    expect(lastWorkdayOnOrBefore("2026-06-19", NO_HOLIDAYS)).toBe("2026-06-19"); // Freitag
  });

  it("Wochenende → vorheriger Freitag", () => {
    expect(lastWorkdayOnOrBefore("2026-06-20", NO_HOLIDAYS)).toBe("2026-06-19"); // Sa → Fr
    expect(lastWorkdayOnOrBefore("2026-06-21", NO_HOLIDAYS)).toBe("2026-06-19"); // So → Fr
  });

  it("Feiertag (Freitag) → vorheriger Donnerstag", () => {
    expect(lastWorkdayOnOrBefore("2026-05-01", new Set(["2026-05-01"]))).toBe("2026-04-30");
  });

  it("Brücke Feiertag-Freitag + Wochenende → Donnerstag davor", () => {
    // Fälligkeit So 2026-05-03, Fr 2026-05-01 ist Feiertag → letzter Arbeitstag Do 04-30
    expect(lastWorkdayOnOrBefore("2026-05-03", new Set(["2026-05-01"]))).toBe("2026-04-30");
  });
});
