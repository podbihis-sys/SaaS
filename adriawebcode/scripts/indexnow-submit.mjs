#!/usr/bin/env node
/**
 * Submits the localized home pages to IndexNow (Bing, Yandex, Seznam, Naver…).
 * The key file lives in public/<key>.txt and is deployed with the site — run
 * this after every content-relevant deploy to trigger recrawling.
 *
 *   node scripts/indexnow-submit.mjs
 */

import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HOST = "adriawebcode.com";
const LOCALES = ["de", "en", "hr", "bs", "sr"];

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const keyFile = readdirSync(publicDir).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error("No IndexNow key file (public/<32-hex>.txt) found.");
  process.exit(1);
}
const key = keyFile.replace(/\.txt$/, "");

const payload = {
  host: HOST,
  key,
  keyLocation: `https://${HOST}/${keyFile}`,
  urlList: LOCALES.map((l) => `https://${HOST}/${l}`),
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

console.log(`IndexNow: HTTP ${res.status} ${res.statusText}`);
console.log(`Submitted: ${payload.urlList.join(", ")}`);
if (!res.ok && res.status !== 202) {
  console.error(await res.text());
  process.exit(1);
}
