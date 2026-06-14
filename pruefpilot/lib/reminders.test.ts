import { describe, expect, it } from "vitest";
import { reminderBody, reminderStageFor, reminderSubject, type ReminderStage } from "./reminders";

const TODAY = "2026-06-12";
const none = new Set<ReminderStage>();

function due(daysFromToday: number): string {
  const base = Date.UTC(2026, 5, 12) + daysFromToday * 86_400_000;
  return new Date(base).toISOString().slice(0, 10);
}

describe("reminderStageFor", () => {
  it.each([
    [61, null],
    [60, "d60"],
    [31, "d60"],
    [30, "d30"],
    [8, "d30"],
    [7, "d7"],
    [1, "d7"],
    [0, "d7"],
    [-1, "overdue"],
    [-90, "overdue"],
  ])("daysLeft=%i → %s", (daysLeft, expected) => {
    const result = reminderStageFor(due(daysLeft), TODAY, none);
    expect(result?.stage ?? null).toBe(expected);
  });

  it("unterdrückt bereits versendete Stufen (Idempotenz pro Lauf)", () => {
    expect(reminderStageFor(due(45), TODAY, new Set<ReminderStage>(["d60"]))).toBeNull();
    expect(reminderStageFor(due(20), TODAY, new Set<ReminderStage>(["d30"]))).toBeNull();
    expect(reminderStageFor(due(3), TODAY, new Set<ReminderStage>(["d7"]))).toBeNull();
    expect(reminderStageFor(due(-5), TODAY, new Set<ReminderStage>(["overdue"]))).toBeNull();
  });

  it("wählt nach Cron-Ausfall die dringlichste offene Stufe statt zu überspringen", () => {
    // d60 wurde versendet, dann fiel der Cron aus — bei 25 Resttagen kommt d30.
    expect(reminderStageFor(due(25), TODAY, new Set<ReminderStage>(["d60"]))?.stage).toBe("d30");
    // Gar nichts versendet, nur noch 5 Tage: genau EINE Mail (d7), kein Dreifach-Spam.
    expect(reminderStageFor(due(5), TODAY, none)?.stage).toBe("d7");
    // d60+d30 versendet, jetzt überfällig: Eskalation kommt trotzdem.
    expect(
      reminderStageFor(due(-2), TODAY, new Set<ReminderStage>(["d60", "d30", "d7"]))?.stage,
    ).toBe("overdue");
  });

  it("liefert daysLeft mit", () => {
    expect(reminderStageFor(due(-3), TODAY, none)).toEqual({ stage: "overdue", daysLeft: -3 });
  });
});

describe("reminder emails", () => {
  const base = {
    deviceName: "Bohrmaschine Halle 2",
    categoryName: "Elektrogerät (ortsveränderlich)",
    dueDate: "2026-07-01",
    companyName: "Muster GmbH",
    deviceUrl: "https://app.example.com/geraete/abc",
  };

  it("Betreff vor Fälligkeit nennt Resttage und Gerät", () => {
    const subject = reminderSubject({ ...base, stage: "d7", daysLeft: 7 });
    expect(subject).toContain("7 Tagen");
    expect(subject).toContain("Bohrmaschine Halle 2");
  });

  it("Eskalations-Betreff markiert Überfälligkeit", () => {
    const subject = reminderSubject({ ...base, stage: "overdue", daysLeft: -4 });
    expect(subject).toContain("ÜBERFÄLLIG");
    expect(subject).toContain("1. Juli 2026");
  });

  it("Body enthält Link und Betriebsname", () => {
    const body = reminderBody({ ...base, stage: "d30", daysLeft: 21 });
    expect(body).toContain(base.deviceUrl);
    expect(body).toContain("Muster GmbH");
    expect(body).not.toContain("revisionssicher");
  });
});
