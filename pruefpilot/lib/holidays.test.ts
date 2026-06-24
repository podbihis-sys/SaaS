import { describe, expect, it } from "vitest";
import { easterSunday, germanHolidays, germanHolidaysForYears } from "./holidays";

describe("easterSunday", () => {
  it.each([
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
  ])("Ostersonntag %i = %s", (year, expected) => {
    expect(easterSunday(year)).toBe(expected);
  });
});

describe("germanHolidays — bundesweit", () => {
  const set = germanHolidays(2026);

  it("enthält die festen bundesweiten Feiertage", () => {
    expect(set).toContain("2026-01-01"); // Neujahr
    expect(set).toContain("2026-05-01"); // Tag der Arbeit
    expect(set).toContain("2026-10-03"); // Tag der Deutschen Einheit
    expect(set).toContain("2026-12-25"); // 1. Weihnachtstag
    expect(set).toContain("2026-12-26"); // 2. Weihnachtstag
  });

  it("enthält die beweglichen Feiertage relativ zu Ostern", () => {
    expect(set).toContain("2026-04-03"); // Karfreitag (Ostern - 2)
    expect(set).toContain("2026-04-06"); // Ostermontag (Ostern + 1)
    expect(set).toContain("2026-05-14"); // Christi Himmelfahrt (Ostern + 39)
    expect(set).toContain("2026-05-25"); // Pfingstmontag (Ostern + 50)
  });

  it("enthält ohne Bundesland keine landesspezifischen Feiertage", () => {
    expect(set).not.toContain("2026-01-06"); // Heilige Drei Könige
    expect(set).not.toContain("2026-10-31"); // Reformationstag
    expect(set).not.toContain("2026-11-01"); // Allerheiligen
  });
});

describe("germanHolidays — landesspezifisch", () => {
  it("Bayern: Heilige Drei Könige, Fronleichnam, Allerheiligen", () => {
    const set = germanHolidays(2026, "BY");
    expect(set).toContain("2026-01-06");
    expect(set).toContain("2026-06-04"); // Fronleichnam (Ostern + 60)
    expect(set).toContain("2026-11-01");
    expect(set).not.toContain("2026-10-31"); // kein Reformationstag in BY
  });

  it("Sachsen: Reformationstag und Buß- und Bettag (Mittwoch 16.–22. Nov)", () => {
    const set = germanHolidays(2026, "SN");
    expect(set).toContain("2026-10-31");
    const busstag = [...set].find((d) => d >= "2026-11-16" && d <= "2026-11-22");
    expect(busstag).toBeDefined();
    expect(new Date(`${busstag}T00:00:00Z`).getUTCDay()).toBe(3); // Mittwoch
  });

  it("unbekannter Code fällt auf bundesweit zurück", () => {
    const unknown = germanHolidays(2026, "XX");
    const bund = germanHolidays(2026);
    expect(unknown.size).toBe(bund.size);
  });
});

describe("germanHolidaysForYears", () => {
  it("vereint mehrere Jahre", () => {
    const set = germanHolidaysForYears([2025, 2026]);
    expect(set).toContain("2025-12-25");
    expect(set).toContain("2026-01-01");
  });
});
