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
  vpe_type: z.enum(["auto", "rolle", "laenge", "rolle_laenge", "meterware"]).default("auto"),
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
  revalidatePath(`/bit/produkte/[kategorie]/${slug}`, "page");
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
    vpe_type: d.vpe_type === "auto" ? null : d.vpe_type,
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
  for (const path of [
    "/bit",
    "/bit/news",
    "/bit/kompetenzen",
    "/bit/branchen",
    "/bit/unternehmen",
    "/bit/qualitaet",
    "/bit/kontakt",
  ]) {
    revalidatePath(path);
  }
  return { ok: true };
}

// ----------------------------------------------------------------------- News
const newsInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1, "Slug erforderlich")
    .regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  title: z.string().min(1, "Titel erforderlich"),
  excerpt: z.string().default(""),
  body: z.string().default(""),
  published_at: z.string().default(""),
  image_path: z.string().default(""),
  image_alt: z.string().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type NewsInput = z.infer<typeof newsInput>;

function revalidateNews(slug: string) {
  revalidatePath("/bit/admin/news");
  revalidatePath("/bit/news");
  revalidatePath(`/bit/news/${slug}`);
}

export async function saveNews(input: NewsInput): Promise<ActionResult> {
  const parsed = newsInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }
  const d = parsed.data;
  const supabase = await createClient();

  const row = {
    slug: d.slug,
    title: d.title,
    excerpt: d.excerpt,
    body: d.body,
    published_at: d.published_at || null,
    image_path: d.image_path || null,
    image_alt: d.image_alt || null,
    status: d.status,
  };

  const { error } = d.id
    ? await supabase.from("bit_news").update(row).eq("id", d.id)
    : await supabase.from("bit_news").insert(row);

  if (error) return { ok: false, error: error.message };
  revalidateNews(d.slug);
  return { ok: true };
}

export async function deleteNews(id: string, slug: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("bit_news").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateNews(slug);
  return { ok: true };
}

// ------------------------------------------------------------------ Kategorien
const categoryInput = z.object({
  id: z
    .string()
    .min(1, "ID erforderlich")
    .regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  name: z.string().min(1, "Name erforderlich"),
  tagline: z.string().default(""),
  description: z.string().default(""),
  image_path: z.string().default(""),
  sort_order: z.number().int().default(0),
});
export type CategoryInput = z.infer<typeof categoryInput>;

function revalidateCatalog() {
  revalidatePath("/bit");
  revalidatePath("/bit/produkte");
  revalidatePath("/bit/admin/kategorien");
}

export async function saveCategory(input: CategoryInput): Promise<ActionResult> {
  const parsed = categoryInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("bit_categories").upsert(
    {
      id: d.id,
      name: d.name,
      tagline: d.tagline || null,
      description: d.description || null,
      image_path: d.image_path || null,
      sort_order: d.sort_order,
    },
    { onConflict: "id" },
  );
  if (error) return { ok: false, error: error.message };
  revalidateCatalog();
  revalidatePath(`/bit/${d.id}`);
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("bit_categories").delete().eq("id", id);
  if (error) {
    return {
      ok: false,
      error: error.message.includes("violates foreign key")
        ? "Kategorie enthält noch Produkte – bitte zuerst umhängen."
        : error.message,
    };
  }
  revalidateCatalog();
  return { ok: true };
}

// ----------------------------------------------------------------- Unterseiten
const pageInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1, "Slug erforderlich")
    .regex(/^[a-z0-9/-]+$/, "Nur Kleinbuchstaben, Zahlen, Bindestriche und /"),
  title: z.string().min(1, "Titel erforderlich"),
  meta_title: z.string().default(""),
  meta_description: z.string().default(""),
  body: z.string().default(""),
  status: z.enum(["draft", "published"]).default("published"),
});
export type PageInput = z.infer<typeof pageInput>;

export async function savePage(input: PageInput): Promise<ActionResult> {
  const parsed = pageInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const row = {
    slug: d.slug,
    title: d.title,
    meta_title: d.meta_title || null,
    meta_description: d.meta_description || null,
    body: d.body,
    status: d.status,
  };
  const { error } = d.id
    ? await supabase.from("bit_pages").update(row).eq("id", d.id)
    : await supabase.from("bit_pages").insert(row);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/bit/admin/seiten");
  revalidatePath(`/bit/${d.slug}`);
  return { ok: true };
}

export async function deletePage(id: string, slug: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("bit_pages").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/bit/admin/seiten");
  revalidatePath(`/bit/${slug}`);
  return { ok: true };
}

// ------------------------------------------------------------------------ FAQ
const faqListInput = z.array(
  z.object({
    group_name: z.string().default(""),
    question: z.string().min(1),
    answer: z.string().default(""),
  }),
);
export type FaqListInput = z.infer<typeof faqListInput>;

/** Ersetzt die komplette FAQ-Liste (Reihenfolge = Listenreihenfolge). */
export async function saveFaqList(items: FaqListInput): Promise<ActionResult> {
  const parsed = faqListInput.safeParse(items);
  if (!parsed.success) return { ok: false, error: "Ungültige Eingabe." };
  const supabase = await createClient();
  const del = await supabase.from("bit_faq").delete().gte("sort_order", -1);
  if (del.error) return { ok: false, error: del.error.message };
  if (parsed.data.length) {
    const { error } = await supabase.from("bit_faq").insert(
      parsed.data.map((f, i) => ({ ...f, sort_order: (i + 1) * 10, status: "published" })),
    );
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/bit/admin/faq");
  revalidatePath("/bit/faq");
  return { ok: true };
}

// ----------------------------------------------------------------------- Team
const teamListInput = z.array(
  z.object({
    name: z.string().min(1),
    role: z.string().default(""),
    phone: z.string().default(""),
    email: z.string().default(""),
    css_only: z.boolean().default(false),
  }),
);
export type TeamListInput = z.infer<typeof teamListInput>;

/** Ersetzt die komplette Team-Liste (Reihenfolge = Listenreihenfolge). */
export async function saveTeamList(items: TeamListInput): Promise<ActionResult> {
  const parsed = teamListInput.safeParse(items);
  if (!parsed.success) return { ok: false, error: "Ungültige Eingabe." };
  const supabase = await createClient();
  const del = await supabase.from("bit_team").delete().gte("sort_order", -1);
  if (del.error) return { ok: false, error: del.error.message };
  if (parsed.data.length) {
    const { error } = await supabase.from("bit_team").insert(
      parsed.data.map((m, i) => ({ ...m, sort_order: (i + 1) * 10, status: "published" })),
    );
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/bit/admin/team");
  revalidatePath("/bit/kontakt");
  return { ok: true };
}

// --------------------------------------------------------------------- Stellen
const jobInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1, "Slug erforderlich")
    .regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  title: z.string().min(1, "Titel erforderlich"),
  intro: z.string().default(""),
  body: z.string().default(""),
  tasks_title: z.string().default("Ihre Aufgaben:"),
  tasks: z.array(z.string().min(1)).default([]),
  closing: z.string().default(""),
  sort_order: z.number().int().default(0),
  status: z.enum(["draft", "published"]).default("published"),
});
export type JobInput = z.infer<typeof jobInput>;

export async function saveJob(input: JobInput): Promise<ActionResult> {
  const parsed = jobInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const row = {
    slug: d.slug,
    title: d.title,
    intro: d.intro,
    body: d.body,
    tasks_title: d.tasks_title,
    tasks: d.tasks,
    closing: d.closing,
    sort_order: d.sort_order,
    status: d.status,
  };
  const { error } = d.id
    ? await supabase.from("bit_jobs").update(row).eq("id", d.id)
    : await supabase.from("bit_jobs").insert(row);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/bit/admin/stellen");
  revalidatePath("/bit/karriere");
  return { ok: true };
}

export async function deleteJob(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("bit_jobs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/bit/admin/stellen");
  revalidatePath("/bit/karriere");
  return { ok: true };
}
