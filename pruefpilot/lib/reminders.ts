import { daysUntil } from "./due";

export type ReminderStage = "d60" | "d30" | "d7" | "final" | "overdue";

export interface ReminderCandidate {
  stage: ReminderStage;
  daysLeft: number;
}

/**
 * Fensterbasierte Stufenwahl: Es wird immer die dringlichste, noch nicht versendete
 * Stufe gewählt. Fällt der Cron einen Tag aus, wird nichts übersprungen — bei
 * daysLeft = 5 ohne bisherige Mails geht direkt die 7-Tage-Mail raus (genau eine).
 *
 * `finalReminderDate` ist der letzte Arbeitstag am/vor der Fälligkeit. Liegt die
 * Fälligkeit auf einem Wochenende/Feiertag, ist dieses Datum früher als `nextDueDate`,
 * sodass die "letzte Info" garantiert an einem Arbeitstag rausgeht. Ohne Angabe
 * (Standard = `nextDueDate`) fällt die Stufe `final` auf den Fälligkeitstag selbst.
 */
export function reminderStageFor(
  nextDueDate: string,
  today: string,
  alreadySent: ReadonlySet<ReminderStage>,
  finalReminderDate: string = nextDueDate,
): ReminderCandidate | null {
  const daysLeft = daysUntil(nextDueDate, today);

  // Bereits überfällig → Eskalation (sofort, unabhängig vom Wochentag).
  if (daysLeft < 0) {
    return alreadySent.has("overdue") ? null : { stage: "overdue", daysLeft };
  }

  // Letzter Arbeitstag vor/auf Fälligkeit erreicht → "letzte Info" am Arbeitstag.
  if (today >= finalReminderDate) {
    return alreadySent.has("final") ? null : { stage: "final", daysLeft };
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
  if (input.stage === "final") {
    return `Letzte Erinnerung: Prüfung „${input.deviceName}“ fällig am ${formatDate(input.dueDate)}`;
  }
  return `Prüfung fällig in ${input.daysLeft} Tagen: ${input.deviceName}`;
}

function finalIntro(input: ReminderEmailInput): string {
  // Stufe `final` mit daysLeft > 0 bedeutet: Fälligkeit liegt auf Wochenende/Feiertag,
  // daher kommt die letzte Info schon heute am letzten Arbeitstag davor.
  if (input.daysLeft > 0) {
    return `dies ist die letzte Erinnerung vor der Prüfung des Geräts „${input.deviceName}“ (${input.categoryName}). Fällig ist sie am ${formatDate(input.dueDate)} — dieser Tag fällt auf ein Wochenende oder einen Feiertag, deshalb erhalten Sie die Info heute, am letzten Arbeitstag davor. Bitte planen Sie die Prüfung rechtzeitig ein.`;
  }
  return `die Prüfung des Geräts „${input.deviceName}“ (${input.categoryName}) ist heute (${formatDate(input.dueDate)}) fällig. Dies ist die letzte Erinnerung vor Ablauf — bitte führen Sie die Prüfung durch und dokumentieren Sie das Ergebnis.`;
}

export function reminderBody(input: ReminderEmailInput): string {
  const intro =
    input.stage === "overdue"
      ? `die Prüfung des Geräts „${input.deviceName}“ (${input.categoryName}) ist seit dem ${formatDate(input.dueDate)} überfällig (${Math.abs(input.daysLeft)} Tage). Bitte holen Sie die Prüfung umgehend nach und dokumentieren Sie das Ergebnis.`
      : input.stage === "final"
        ? finalIntro(input)
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
