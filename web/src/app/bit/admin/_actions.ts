"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { execute } from "@/app/bit/_lib/db";

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

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

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
  // vpe_type: "auto" wird in der DB als NULL gefuehrt.
  const vpe = d.vpe_type === "auto" ? null : d.vpe_type;
  try {
    if (d.id) {
      await execute(
        `UPDATE bit_products SET slug=?,category_id=?,code=?,name=?,tagline=?,description=?,material=?,temperature=?,unit=?,vpe_type=?,sizes=?,colors=?,features=?,applications=?,tech=?,datasheet_url=?,image_path=?,image_alt=?,status=? WHERE id=?`,
        [
          d.slug, d.category_id, d.code, d.name, d.tagline || null, d.description,
          d.material || null, d.temperature || null, d.unit, vpe,
          JSON.stringify(d.sizes), JSON.stringify(d.colors), JSON.stringify(d.features),
          JSON.stringify(d.applications), JSON.stringify(d.tech),
          d.datasheet_url || null, d.image_path || null, d.image_alt || null, d.status, d.id,
        ],
      );
    } else {
      await execute(
        `INSERT INTO bit_products (id,slug,category_id,code,name,tagline,description,material,temperature,unit,vpe_type,sizes,colors,features,applications,tech,datasheet_url,image_path,image_alt,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          randomUUID(), d.slug, d.category_id, d.code, d.name, d.tagline || null, d.description,
          d.material || null, d.temperature || null, d.unit, vpe,
          JSON.stringify(d.sizes), JSON.stringify(d.colors), JSON.stringify(d.features),
          JSON.stringify(d.applications), JSON.stringify(d.tech),
          d.datasheet_url || null, d.image_path || null, d.image_alt || null, d.status,
        ],
      );
    }
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
  revalidateProduct(d.slug);
  return { ok: true };
}

export async function deleteProduct(id: string, slug: string): Promise<ActionResult> {
  try {
    await execute("DELETE FROM bit_products WHERE id = ?", [id]);
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
  revalidateProduct(slug);
  return { ok: true };
}

const contentSchema = z.array(z.object({ key: z.string().min(1), value: z.string() }));

export async function saveContent(
  entries: { key: string; value: string }[],
): Promise<ActionResult> {
  const parsed = contentSchema.safeParse(entries);
  if (!parsed.success) return { ok: false, error: "Ungültige Eingabe." };
  try {
    for (const e of parsed.data) {
      await execute(
        "INSERT INTO bit_content (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=VALUES(`value`)",
        [e.key, e.value],
      );
    }
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
  for (const path of [
    "/bit",
    "/bit/news",
    "/bit/kompetenzen",
    "/bit/branchen",
    "/bit/die-bit",
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
  title_en: z.string().default(""),
  excerpt_en: z.string().default(""),
  body_en: z.string().default(""),
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
  revalidatePath("/bit/en/news");
  revalidatePath(`/bit/en/news/${slug}`);
}

export async function saveNews(input: NewsInput): Promise<ActionResult> {
  const parsed = newsInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }
  const d = parsed.data;
  try {
    if (d.id) {
      await execute(
        `UPDATE bit_news SET slug=?,title=?,excerpt=?,body=?,title_en=?,excerpt_en=?,body_en=?,published_at=?,image_path=?,image_alt=?,status=? WHERE id=?`,
        [
          d.slug, d.title, d.excerpt, d.body, d.title_en || null, d.excerpt_en || null,
          d.body_en || null, d.published_at || null, d.image_path || null, d.image_alt || null,
          d.status, d.id,
        ],
      );
    } else {
      await execute(
        `INSERT INTO bit_news (id,slug,title,excerpt,body,title_en,excerpt_en,body_en,published_at,image_path,image_alt,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          randomUUID(), d.slug, d.title, d.excerpt, d.body, d.title_en || null,
          d.excerpt_en || null, d.body_en || null, d.published_at || null,
          d.image_path || null, d.image_alt || null, d.status,
        ],
      );
    }
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
  revalidateNews(d.slug);
  return { ok: true };
}

export async function deleteNews(id: string, slug: string): Promise<ActionResult> {
  try {
    await execute("DELETE FROM bit_news WHERE id = ?", [id]);
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
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
  // Upsert auf dem natuerlichen Schluessel id (onConflict=id).
  try {
    await execute(
      `INSERT INTO bit_categories (id,name,tagline,description,image_path,sort_order) VALUES (?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name),tagline=VALUES(tagline),description=VALUES(description),image_path=VALUES(image_path),sort_order=VALUES(sort_order)`,
      [d.id, d.name, d.tagline || null, d.description || null, d.image_path || null, d.sort_order],
    );
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
  revalidateCatalog();
  revalidatePath(`/bit/${d.id}`);
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await execute("DELETE FROM bit_categories WHERE id = ?", [id]);
  } catch (e) {
    const msg = errMsg(e);
    // MariaDB-FK-Verletzung (ON DELETE RESTRICT): freundliche Meldung.
    return {
      ok: false,
      error: /foreign key|a foreign key constraint fails|ER_ROW_IS_REFERENCED/i.test(msg)
        ? "Kategorie enthält noch Produkte – bitte zuerst umhängen."
        : msg,
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
  try {
    if (d.id) {
      await execute(
        `UPDATE bit_pages SET slug=?,title=?,meta_title=?,meta_description=?,body=?,status=? WHERE id=?`,
        [d.slug, d.title, d.meta_title || null, d.meta_description || null, d.body, d.status, d.id],
      );
    } else {
      await execute(
        `INSERT INTO bit_pages (id,slug,title,meta_title,meta_description,body,status) VALUES (?,?,?,?,?,?,?)`,
        [randomUUID(), d.slug, d.title, d.meta_title || null, d.meta_description || null, d.body, d.status],
      );
    }
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
  revalidatePath("/bit/admin/seiten");
  revalidatePath(`/bit/${d.slug}`);
  return { ok: true };
}

export async function deletePage(id: string, slug: string): Promise<ActionResult> {
  try {
    await execute("DELETE FROM bit_pages WHERE id = ?", [id]);
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
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
  try {
    await execute("DELETE FROM bit_faq");
    let i = 0;
    for (const f of parsed.data) {
      i += 1;
      await execute(
        "INSERT INTO bit_faq (id,group_name,question,answer,sort_order,status) VALUES (?,?,?,?,?, 'published')",
        [randomUUID(), f.group_name, f.question, f.answer, i * 10],
      );
    }
  } catch (e) {
    return { ok: false, error: errMsg(e) };
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
  try {
    await execute("DELETE FROM bit_team");
    let i = 0;
    for (const m of parsed.data) {
      i += 1;
      await execute(
        "INSERT INTO bit_team (id,name,role,phone,email,css_only,sort_order,status) VALUES (?,?,?,?,?,?,?, 'published')",
        [randomUUID(), m.name, m.role, m.phone, m.email, m.css_only ? 1 : 0, i * 10],
      );
    }
  } catch (e) {
    return { ok: false, error: errMsg(e) };
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
  title_en: z.string().default(""),
  intro_en: z.string().default(""),
  body_en: z.string().default(""),
  tasks_title_en: z.string().default(""),
  tasks_en: z.array(z.string().min(1)).default([]),
  closing_en: z.string().default(""),
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
  const tasksEn = d.tasks_en.length ? JSON.stringify(d.tasks_en) : null;
  try {
    if (d.id) {
      await execute(
        `UPDATE bit_jobs SET slug=?,title=?,intro=?,body=?,tasks_title=?,tasks=?,closing=?,title_en=?,intro_en=?,body_en=?,tasks_title_en=?,tasks_en=?,closing_en=?,sort_order=?,status=? WHERE id=?`,
        [
          d.slug, d.title, d.intro, d.body, d.tasks_title, JSON.stringify(d.tasks), d.closing,
          d.title_en || null, d.intro_en || null, d.body_en || null, d.tasks_title_en || null,
          tasksEn, d.closing_en || null, d.sort_order, d.status, d.id,
        ],
      );
    } else {
      await execute(
        `INSERT INTO bit_jobs (id,slug,title,intro,body,tasks_title,tasks,closing,title_en,intro_en,body_en,tasks_title_en,tasks_en,closing_en,sort_order,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          randomUUID(), d.slug, d.title, d.intro, d.body, d.tasks_title, JSON.stringify(d.tasks),
          d.closing, d.title_en || null, d.intro_en || null, d.body_en || null,
          d.tasks_title_en || null, tasksEn, d.closing_en || null, d.sort_order, d.status,
        ],
      );
    }
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
  revalidatePath("/bit/admin/stellen");
  revalidatePath("/bit/karriere");
  return { ok: true };
}

export async function deleteJob(id: string): Promise<ActionResult> {
  try {
    await execute("DELETE FROM bit_jobs WHERE id = ?", [id]);
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
  revalidatePath("/bit/admin/stellen");
  revalidatePath("/bit/karriere");
  return { ok: true };
}
