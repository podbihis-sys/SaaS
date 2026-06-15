"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/app/bit/_lib/supabase-server";

const techRow = z.object({ label: z.string().min(1), value: z.string().min(1) });

const productInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1, "Slug erforderlich")
    .regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  category_id: z.string().min(1, "Kategorie erforderlich"),
  code: z.string().default(""),
  name: z.string().min(1, "Name erforderlich"),
  tagline: z.string().default(""),
  description: z.string().default(""),
  material: z.string().default(""),
  temperature: z.string().default(""),
  unit: z.string().default("Stück"),
  sizes: z.array(z.string().min(1)).default([]),
  colors: z.array(z.string().min(1)).default([]),
  features: z.array(z.string().min(1)).default([]),
  applications: z.array(z.string().min(1)).default([]),
  tech: z.array(techRow).default([]),
  datasheet_url: z.string().default(""),
  image_path: z.string().default(""),
  image_alt: z.string().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type ProductInput = z.infer<typeof productInput>;
export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateProduct(slug: string) {
  revalidatePath("/bit/admin");
  revalidatePath("/bit");
  revalidatePath("/bit/produkte");
  revalidatePath(`/bit/produkte/${slug}`);
}

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  const parsed = productInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }
  const d = parsed.data;
  const supabase = await createClient();

  const row = {
    slug: d.slug,
    category_id: d.category_id,
    code: d.code,
    name: d.name,
    tagline: d.tagline || null,
    description: d.description,
    material: d.material || null,
    temperature: d.temperature || null,
    unit: d.unit,
    sizes: d.sizes,
    colors: d.colors,
    features: d.features,
    applications: d.applications,
    tech: d.tech,
    datasheet_url: d.datasheet_url || null,
    image_path: d.image_path || null,
    image_alt: d.image_alt || null,
    status: d.status,
  };

  const { error } = d.id
    ? await supabase.from("bit_products").update(row).eq("id", d.id)
    : await supabase.from("bit_products").insert(row);

  if (error) return { ok: false, error: error.message };
  revalidateProduct(d.slug);
  return { ok: true };
}

export async function deleteProduct(id: string, slug: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("bit_products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateProduct(slug);
  return { ok: true };
}

const contentSchema = z.array(z.object({ key: z.string().min(1), value: z.string() }));

export async function saveContent(
  entries: { key: string; value: string }[],
): Promise<ActionResult> {
  const parsed = contentSchema.safeParse(entries);
  if (!parsed.success) return { ok: false, error: "Ungültige Eingabe." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("bit_content")
    .upsert(parsed.data.map((e) => ({ key: e.key, value: e.value })), { onConflict: "key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/bit");
  revalidatePath("/bit/unternehmen");
  revalidatePath("/bit/qualitaet");
  revalidatePath("/bit/kontakt");
  return { ok: true };
}
