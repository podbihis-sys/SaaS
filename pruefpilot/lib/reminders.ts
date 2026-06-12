import { daysUntil } from "./due";

export type ReminderStage = "d60" | "d30" | "d7" | "overdue";

export interface ReminderCandidate {
  stage: ReminderStage;
  daysLeft: number;
}

/**
 * Fensterbasierte Stufenwahl: Es wird immer die dringlichste, noch nicht versendete
 * Stufe gewählt. Fällt der Cron einen Tag aus, wird nichts übersprungen — bei
 * daysLeft = 5 ohne bisherige Mails geht direkt die 7-Tage-Mail raus (genau eine).
 */
export function reminderStageFor(
  nextDueDate: string,
  today: string,
  alreadySent: ReadonlySet<ReminderStage>,
): ReminderCandidate | null {
  const daysLeft = daysUntil(nextDueDate, today);
  if (daysLeft < 0) {
    return alreadySent.has("overdue") ? null : { stage: "overdue", daysLeft };
  }
  if (daysLeft <= 7) {
    return alreadySent.has("d7") ? null : { stage: "d7", daysLeft };
  }
  if (daysLeft <= 30) {
    return alreadySent.has("d30") ? null : { stage: "d30", daysLeft };
  }
  if (daysLeft <= 60) {
    return alreadySent.has("d60") ? null : { stage: "d60", daysLeft };
  }
  return null;
}

const DATE_FORMAT = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "long",
  timeZone: "Europe/Berlin",
});

function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00`));
}

export interface ReminderEmailInput {
  stage: ReminderStage;
  deviceName: string;
  categoryName: string;
  dueDate: string;
  daysLeft: number;
  companyName: string;
  deviceUrl: string;
}

export function reminderSubject(input: ReminderEmailInput): string {
  if (input.stage === "overdue") {
    return `ÜBERFÄLLIG: Prüfung „${input.deviceName}“ war am ${formatDate(input.dueDate)} fällig`;
  }
  return `Prüfung fällig in ${input.daysLeft} Tagen: ${input.deviceName}`;
}

export function reminderBody(input: ReminderEmailInput): string {
  const intro =
    input.stage === "overdue"
      ? `die Prüfung des Geräts „${input.deviceName}“ (${input.categoryName}) ist seit dem ${formatDate(input.dueDate)} überfällig (${Math.abs(input.daysLeft)} Tage). Bitte holen Sie die Prüfung umgehend nach und dokumentieren Sie das Ergebnis.`
      : `für das Gerät „${input.deviceName}“ (${input.categoryName}) steht die nächste Prüfung am ${formatDate(input.dueDate)} an — in ${input.daysLeft} Tagen.`;

  return [
    `Guten Tag,`,
    ``,
    intro,
    ``,
    `Geräteakte öffnen und Prüfung dokumentieren:`,
    input.deviceUrl,
    ``,
    `Diese Erinnerung wurde automatisch von PrüfPilot für ${input.companyName} erstellt.`,
    `Prüfintervalle sind Empfehlungen — maßgeblich sind die für Ihren Betrieb geltenden Vorschriften.`,
  ].join("\n");
}
