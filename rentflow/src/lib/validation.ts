import { z } from "zod";

/** YYYY-MM-DD calendar date. */
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum muss im Format JJJJ-MM-TT sein")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Ungültiges Datum");

export const availabilitySchema = z
  .object({
    item_id: z.string().uuid(),
    start_date: dateString,
    end_date: dateString,
    quantity: z.number().int().min(1).default(1),
  })
  .refine((d) => d.start_date <= d.end_date, {
    message: "Enddatum darf nicht vor dem Startdatum liegen",
    path: ["end_date"],
  });

export const bookingCreateSchema = z
  .object({
    slug: z.string().min(1),
    item_id: z.string().uuid(),
    start_date: dateString,
    end_date: dateString,
    quantity: z.number().int().min(1).default(1),
    customer_name: z.string().trim().min(1, "Name erforderlich").max(200),
    customer_email: z.string().trim().email("Ungültige E-Mail"),
    customer_phone: z.string().trim().max(40).optional(),
  })
  .refine((d) => d.start_date <= d.end_date, {
    message: "Enddatum darf nicht vor dem Startdatum liegen",
    path: ["end_date"],
  });

export const platformCheckoutSchema = z.object({
  plan: z.enum(["solo", "pro"]),
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type PlatformCheckoutInput = z.infer<typeof platformCheckoutSchema>;
