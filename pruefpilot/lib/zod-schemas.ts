import { z } from "zod";
import { CATEGORY_IDS } from "./categories";
import { INSPECTION_RESULT_VALUES } from "./inspections";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum im Format JJJJ-MM-TT angeben");

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximal ${max} Zeichen`)
    .transform((value) => (value === "" ? null : value))
    .nullish();

export const companySchema = z.object({
  name: z.string().trim().min(1, "Betriebsname erforderlich").max(200, "Maximal 200 Zeichen"),
  contactEmail: z.string().trim().email("Gültige E-Mail-Adresse erforderlich"),
});

export const deviceSchema = z
  .object({
    name: z.string().trim().min(1, "Gerätename erforderlich").max(200, "Maximal 200 Zeichen"),
    categoryId: z.enum(CATEGORY_IDS, { message: "Kategorie wählen" }),
    location: optionalTrimmed(200),
    serialNumber: optionalTrimmed(200),
    intervalMonths: z.coerce
      .number({ message: "Prüfintervall in Monaten angeben" })
      .int("Ganze Monate angeben")
      .min(1, "Mindestens 1 Monat")
      .max(120, "Maximal 120 Monate"),
    lastInspectedAt: isoDate.or(z.literal("")).optional(),
    nextDueDate: isoDate.or(z.literal("")).optional(),
    notes: optionalTrimmed(2000),
  })
  .superRefine((value, ctx) => {
    if (!value.lastInspectedAt && !value.nextDueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["lastInspectedAt"],
        message: "Entweder „zuletzt geprüft am“ oder „nächste Fälligkeit“ angeben",
      });
    }
  });

export const inspectionSchema = z.object({
  inspectedAt: isoDate,
  inspectorName: z.string().trim().min(1, "Name des Prüfers erforderlich").max(200, "Maximal 200 Zeichen"),
  result: z.enum(INSPECTION_RESULT_VALUES, { message: "Prüfergebnis wählen" }),
  comment: optionalTrimmed(2000),
});

export const registerSchema = z.object({
  email: z.string().trim().email("Gültige E-Mail-Adresse erforderlich"),
  password: z.string().min(8, "Passwort mit mindestens 8 Zeichen"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Gültige E-Mail-Adresse erforderlich"),
  password: z.string().min(1, "Passwort erforderlich"),
});
