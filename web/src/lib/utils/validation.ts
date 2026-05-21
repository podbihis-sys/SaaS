import { z } from "zod";

export const emailSchema = z.string().email("Ungültige E-Mail-Adresse");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Mindestens 8 Zeichen"),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(8, "Mindestens 8 Zeichen"),
    confirmPassword: z.string().min(8),
    companyName: z.string().min(2, "Firmenname erforderlich"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwörter stimmen nicht überein",
  });

export const magicLinkSchema = z.object({
  email: emailSchema,
});

export const customerSchema = z.object({
  name: z.string().min(1, "Name erforderlich"),
  email: z.string().email().or(z.literal("")).optional(),
  phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export const inquirySchema = z.object({
  customer_id: z.string().uuid("Kunde wählen"),
  title: z.string().min(1, "Titel erforderlich"),
  description: z.string().optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const priceItemSchema = z.object({
  kind: z.enum(["labor", "material", "area"]),
  key: z.string().min(1, "Schlüssel erforderlich"),
  label: z.string().min(1, "Bezeichnung erforderlich"),
  unit: z.enum(["h", "m²", "m", "kg", "pcs"]),
  price: z.number().nonnegative("Preis muss >= 0 sein"),
});

export type PriceItemInput = z.infer<typeof priceItemSchema>;

export const companySettingsSchema = z.object({
  name: z.string().min(1),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  vat_id: z.string().optional(),
  default_vat_rate: z.number().min(0).max(100),
  bank_name: z.string().optional(),
  bank_iban: z.string().optional(),
  bank_bic: z.string().optional(),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;

export const inviteSchema = z.object({
  email: emailSchema,
  role: z.enum(["owner", "admin", "member"]),
});

export type InviteInput = z.infer<typeof inviteSchema>;
