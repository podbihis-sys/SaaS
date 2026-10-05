#!/usr/bin/env node
// migrate-supabase-to-mariadb.mjs
// Einmalige Datenuebernahme vom BIT-Supabase-Projekt nach MariaDB.
//
// Liest alle CMS-Tabellen ueber die Supabase-REST-API (anon key) und schreibt
// sie nach MariaDB (mysql2). Bilder aus dem Storage-Bucket werden nach
// BIT_UPLOAD_DIR heruntergeladen. Idempotent: pro Tabelle TRUNCATE + INSERT.
//
// WIRD SPAETER VOM NUTZER AUSGEFUEHRT, wenn DB + Supabase erreichbar sind.
//
// Benoetigte Umgebungsvariablen:
//   NEXT_PUBLIC_BIT_SUPABASE_URL, NEXT_PUBLIC_BIT_SUPABASE_ANON_KEY
//   BIT_DB_HOST/PORT/USER/PASSWORD/NAME  (Fallback DB_*)
//   BIT_UPLOAD_DIR                       (Ziel fuer heruntergeladene Bilder)
//
// Aufruf:  node scripts/migrate-supabase-to-mariadb.mjs

import mysql from "mysql2/promise";
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function env(name, fallback) {
  return process.env[`BIT_${name}`] ?? process.env[name] ?? fallback;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_BIT_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_BIT_SUPABASE_ANON_KEY;
const BUCKET = "bit-product-images";
const UPLOAD_DIR = path.resolve(env("UPLOAD_DIR", ".bit-uploads"));

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("NEXT_PUBLIC_BIT_SUPABASE_URL / _ANON_KEY fehlen.");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const db = await mysql.createConnection({
  host: env("DB_HOST", "127.0.0.1"),
  port: Number(env("DB_PORT", "3306")),
  user: env("DB_USER"),
  password: env("DB_PASSWORD"),
  database: env("DB_NAME"),
  multipleStatements: true,
});

/** Alle Zeilen einer Supabase-Tabelle (paginiert). */
async function fetchAll(table) {
  const out = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await sb
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return out;
}

const J = (v) => JSON.stringify(Array.isArray(v) ? v : v ?? []);
const n = (v) => (v === undefined ? null : v);

const imageKeys = new Set();
function collectImage(key) {
  if (key && !/^https?:\/\//.test(key) && !key.startsWith("/")) imageKeys.add(key);
}

async function truncate(table) {
  await db.query(`TRUNCATE TABLE ${table}`);
}

async function run() {
  await db.query("SET FOREIGN_KEY_CHECKS = 0");

  // --- Kategorien ---
  const cats = await fetchAll("bit_categories");
  await truncate("bit_categories");
  for (const c of cats) {
    collectImage(c.image_path);
    await db.execute(
      `INSERT INTO bit_categories (id,name,tagline,description,image_path,sort_order) VALUES (?,?,?,?,?,?)`,
      [c.id, c.name, n(c.tagline), n(c.description), n(c.image_path), c.sort_order ?? 0],
    );
  }
  console.log(`bit_categories: ${cats.length}`);

  // --- Produkte ---
  const prods = await fetchAll("bit_products");
  await truncate("bit_products");
  for (const p of prods) {
    collectImage(p.image_path);
    await db.execute(
      `INSERT INTO bit_products (id,slug,category_id,code,name,tagline,description,material,temperature,unit,vpe_type,sizes,colors,features,applications,tech,datasheet_url,image_path,image_alt,status,sort_order)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        p.id, p.slug, p.category_id, p.code ?? "", p.name, n(p.tagline), p.description ?? "",
        n(p.material), n(p.temperature), p.unit ?? "Stück", n(p.vpe_type),
        J(p.sizes), J(p.colors), J(p.features), J(p.applications), J(p.tech),
        n(p.datasheet_url), n(p.image_path), n(p.image_alt), p.status ?? "draft", p.sort_order ?? 0,
      ],
    );
  }
  console.log(`bit_products: ${prods.length}`);

  // --- News ---
  const news = await fetchAll("bit_news");
  await truncate("bit_news");
  for (const x of news) {
    collectImage(x.image_path);
    await db.execute(
      `INSERT INTO bit_news (id,slug,title,excerpt,body,image_path,image_alt,published_at,status,sort_order,title_en,excerpt_en,body_en)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        x.id, x.slug, x.title, x.excerpt ?? "", x.body ?? "", n(x.image_path), n(x.image_alt),
        n(x.published_at), x.status ?? "draft", x.sort_order ?? 0,
        n(x.title_en), n(x.excerpt_en), n(x.body_en),
      ],
    );
  }
  console.log(`bit_news: ${news.length}`);

  // --- Unterseiten ---
  const pages = await fetchAll("bit_pages");
  await truncate("bit_pages");
  for (const x of pages) {
    await db.execute(
      `INSERT INTO bit_pages (id,slug,title,meta_title,meta_description,body,status) VALUES (?,?,?,?,?,?,?)`,
      [x.id, x.slug, x.title, n(x.meta_title), n(x.meta_description), x.body ?? "", x.status ?? "draft"],
    );
  }
  console.log(`bit_pages: ${pages.length}`);

  // --- Stellen ---
  const jobs = await fetchAll("bit_jobs");
  await truncate("bit_jobs");
  for (const x of jobs) {
    await db.execute(
      `INSERT INTO bit_jobs (id,slug,title,intro,body,tasks_title,tasks,closing,title_en,intro_en,body_en,tasks_title_en,tasks_en,closing_en,sort_order,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        x.id, x.slug, x.title, x.intro ?? "", x.body ?? "", x.tasks_title ?? "Ihre Aufgaben:",
        J(x.tasks), x.closing ?? "", n(x.title_en), n(x.intro_en), n(x.body_en),
        n(x.tasks_title_en), x.tasks_en ? J(x.tasks_en) : null, n(x.closing_en),
        x.sort_order ?? 0, x.status ?? "published",
      ],
    );
  }
  console.log(`bit_jobs: ${jobs.length}`);

  // --- FAQ ---
  const faq = await fetchAll("bit_faq");
  await truncate("bit_faq");
  for (const x of faq) {
    await db.execute(
      `INSERT INTO bit_faq (id,group_name,question,answer,sort_order,status) VALUES (?,?,?,?,?,?)`,
      [x.id, x.group_name ?? "", x.question, x.answer ?? "", x.sort_order ?? 0, x.status ?? "published"],
    );
  }
  console.log(`bit_faq: ${faq.length}`);

  // --- Team ---
  const team = await fetchAll("bit_team");
  await truncate("bit_team");
  for (const x of team) {
    await db.execute(
      `INSERT INTO bit_team (id,name,role,phone,email,sort_order,css_only,status) VALUES (?,?,?,?,?,?,?,?)`,
      [x.id, x.name, x.role ?? "", x.phone ?? "", x.email ?? "", x.sort_order ?? 0, x.css_only ? 1 : 0, x.status ?? "published"],
    );
  }
  console.log(`bit_team: ${team.length}`);

  // --- Textbausteine ---
  const content = await fetchAll("bit_content");
  await truncate("bit_content");
  for (const x of content) {
    await db.execute("INSERT INTO bit_content (`key`,`value`) VALUES (?,?)", [x.key, x.value ?? ""]);
  }
  console.log(`bit_content: ${content.length}`);

  // Hinweis: bit_admins wird NICHT migriert (Supabase-Auth-Passwoerter sind
  // nicht uebertragbar). Admin-Konten nach der Migration mit create-admin.mjs
  // neu anlegen.

  await db.query("SET FOREIGN_KEY_CHECKS = 1");

  // --- Bilder aus dem Storage herunterladen ---
  let ok = 0;
  let fail = 0;
  for (const key of imageKeys) {
    try {
      const { data, error } = await sb.storage.from(BUCKET).download(key);
      if (error || !data) throw error ?? new Error("leer");
      const abs = path.resolve(UPLOAD_DIR, key);
      await mkdir(path.dirname(abs), { recursive: true });
      await writeFile(abs, Buffer.from(await data.arrayBuffer()));
      ok += 1;
    } catch (e) {
      fail += 1;
      console.warn(`Bild fehlgeschlagen: ${key} (${e instanceof Error ? e.message : e})`);
    }
  }
  console.log(`Bilder: ${ok} geladen, ${fail} fehlgeschlagen -> ${UPLOAD_DIR}`);
}

try {
  await run();
  console.log("Migration abgeschlossen.");
} catch (e) {
  console.error("Migration fehlgeschlagen:", e);
  process.exitCode = 1;
} finally {
  await db.end();
}
