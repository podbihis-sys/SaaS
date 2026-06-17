#!/usr/bin/env node
/**
 * Copies every file in a Supabase Storage bucket from the CLOUD project into the
 * self-hosted Storage API. Version-independent (uses the public client API, not
 * raw filesystem paths).
 *
 * Run it with the web app's node_modules on the path, e.g.:
 *
 *   set -a; source .env.selfhost; set +a
 *   cd web && node ../scripts/migrate-storage.mjs
 *
 * Required env (from .env.selfhost):
 *   CLOUD_SUPABASE_URL, CLOUD_SERVICE_ROLE_KEY   – source (cloud)
 *   SUPABASE_PUBLIC_URL, SERVICE_ROLE_KEY        – target (self-hosted)
 *   BIT_STORAGE_BUCKET                           – default: bit-product-images
 */
import { createClient } from "@supabase/supabase-js";

const {
  CLOUD_SUPABASE_URL,
  CLOUD_SERVICE_ROLE_KEY,
  SUPABASE_PUBLIC_URL,
  SERVICE_ROLE_KEY,
  BIT_STORAGE_BUCKET = "bit-product-images",
} = process.env;

for (const [k, v] of Object.entries({
  CLOUD_SUPABASE_URL,
  CLOUD_SERVICE_ROLE_KEY,
  SUPABASE_PUBLIC_URL,
  SERVICE_ROLE_KEY,
})) {
  if (!v) {
    console.error(`Missing env var: ${k}`);
    process.exit(1);
  }
}

const source = createClient(CLOUD_SUPABASE_URL, CLOUD_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const target = createClient(SUPABASE_PUBLIC_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/** Recursively list every object path under a prefix. */
async function listAll(client, bucket, prefix = "") {
  const out = [];
  const limit = 100;
  let offset = 0;
  for (;;) {
    const { data, error } = await client.storage
      .from(bucket)
      .list(prefix, { limit, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Folders come back with a null id; recurse into them.
      if (entry.id === null) out.push(...(await listAll(client, bucket, path)));
      else out.push({ path, contentType: entry.metadata?.mimetype });
    }
    if (data.length < limit) break;
    offset += limit;
  }
  return out;
}

async function ensureBucket() {
  const { data } = await source.storage.getBucket(BIT_STORAGE_BUCKET);
  const isPublic = data?.public ?? true;
  const { error } = await target.storage.createBucket(BIT_STORAGE_BUCKET, {
    public: isPublic,
    fileSizeLimit: data?.file_size_limit ?? undefined,
    allowedMimeTypes: data?.allowed_mime_types ?? undefined,
  });
  if (error && !/already exists/i.test(error.message)) throw error;
  console.log(`Bucket "${BIT_STORAGE_BUCKET}" ready (public=${isPublic}).`);
}

async function main() {
  await ensureBucket();
  const files = await listAll(source, BIT_STORAGE_BUCKET);
  console.log(`Found ${files.length} files in cloud bucket.`);

  let ok = 0;
  let failed = 0;
  for (const { path, contentType } of files) {
    const { data: blob, error: dlErr } = await source.storage
      .from(BIT_STORAGE_BUCKET)
      .download(path);
    if (dlErr) {
      console.error(`  download failed: ${path}: ${dlErr.message}`);
      failed++;
      continue;
    }
    const { error: upErr } = await target.storage
      .from(BIT_STORAGE_BUCKET)
      .upload(path, blob, { contentType, upsert: true });
    if (upErr) {
      console.error(`  upload failed: ${path}: ${upErr.message}`);
      failed++;
      continue;
    }
    ok++;
    if (ok % 25 === 0) console.log(`  ...${ok} copied`);
  }
  console.log(`Done. Copied ${ok} files, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
