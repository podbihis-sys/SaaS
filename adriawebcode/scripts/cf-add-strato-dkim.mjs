#!/usr/bin/env node
/**
 * Copies STRATO's outbound-mail DKIM selectors into Cloudflare faithfully.
 *
 * Cloudflare's onboarding scan misses these, and the domain publishes
 * DMARC p=reject, so without them STRATO-signed mail from @adriawebcode.com
 * would fail DKIM (and be rejected) after the nameserver switch.
 *
 * Values are read live from the STRATO-authoritative DNS via DoH and each
 * record's character-strings are concatenated with no separator (how a
 * resolver reconstructs a split TXT), so the public key is byte-perfect.
 *
 * Usage: CF_API_TOKEN=xxxxx node scripts/cf-add-strato-dkim.mjs [--dry]
 */

const ZONE_NAME = "adriawebcode.com";
const SELECTORS = ["strato-dkim-0002", "strato-dkim-0003"];
const DRY = process.argv.includes("--dry");
const TOKEN = process.env.CF_API_TOKEN;
const API = "https://api.cloudflare.com/client/v4";

if (!TOKEN) {
  console.error("CF_API_TOKEN not set.");
  process.exit(1);
}

async function cf(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(`CF ${path}: ${JSON.stringify(json.errors)}`);
  return json;
}

/** Read a TXT record live and rebuild the full value from its chunks. */
async function liveTxt(name) {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${name}&type=TXT`,
    { headers: { accept: "application/dns-json" } },
  );
  const json = await res.json();
  const answer = (json.Answer || []).find((a) => a.type === 16);
  if (!answer) return null;
  // DoH returns the character-strings quoted and space-separated. A resolver
  // concatenates the strings with NO separator to get the real value.
  const chunks = answer.data.match(/"((?:[^"\\]|\\.)*)"/g) || [];
  return chunks.map((c) => c.slice(1, -1)).join("");
}

async function main() {
  const zone = (await cf(`/zones?name=${ZONE_NAME}`)).result[0];
  if (!zone) throw new Error(`Zone ${ZONE_NAME} not found.`);
  const existing = (await cf(`/zones/${zone.id}/dns_records?per_page=200`)).result;

  for (const sel of SELECTORS) {
    const fqdn = `${sel}._domainkey.${ZONE_NAME}`;
    const value = await liveTxt(fqdn);
    if (!value) {
      console.log(`! ${sel}: not found on live DNS, skipping`);
      continue;
    }
    const match = existing.find((r) => r.type === "TXT" && r.name === fqdn);
    if (match && match.content === value) {
      console.log(`✓ ${fqdn}  (already correct)`);
      continue;
    }
    const body = JSON.stringify({ type: "TXT", name: fqdn, content: value, ttl: 1 });
    if (DRY) {
      console.log(`${match ? "~" : "+"} ${fqdn}  WOULD ${match ? "UPDATE" : "CREATE"} (${value.length} chars)`);
      continue;
    }
    if (match) {
      await cf(`/zones/${zone.id}/dns_records/${match.id}`, { method: "PUT", body });
      console.log(`~ ${fqdn}  UPDATED (${value.length} chars)`);
    } else {
      await cf(`/zones/${zone.id}/dns_records`, { method: "POST", body });
      console.log(`+ ${fqdn}  CREATED (${value.length} chars)`);
    }
  }
  console.log(DRY ? "\nDry run complete." : "\nDKIM selectors synced.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
