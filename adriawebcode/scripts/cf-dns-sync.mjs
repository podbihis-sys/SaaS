#!/usr/bin/env node
/**
 * Idempotent Cloudflare DNS sync for adriawebcode.com.
 *
 * Replicates the exact record set the domain currently serves from STRATO,
 * plus the one record Resend still needs (the `send` subdomain MX), so the
 * website stays on Vercel and the @adriawebcode.com mailboxes keep flowing
 * through STRATO after the nameserver switch.
 *
 * Usage:
 *   CF_API_TOKEN=xxxxx node scripts/cf-dns-sync.mjs          # apply
 *   CF_API_TOKEN=xxxxx node scripts/cf-dns-sync.mjs --dry    # preview only
 *
 * The token needs Zone:Read + DNS:Edit for the adriawebcode.com zone.
 */

const ZONE_NAME = "adriawebcode.com";
const DRY = process.argv.includes("--dry");
const TOKEN = process.env.CF_API_TOKEN;

if (!TOKEN) {
  console.error("CF_API_TOKEN not set. Export the scoped Cloudflare token first.");
  process.exit(1);
}

const API = "https://api.cloudflare.com/client/v4";

/**
 * Desired records. `proxied:false` (DNS-only / grey cloud) is mandatory for the
 * Vercel A/CNAME — proxying them breaks Vercel's TLS and edge routing.
 * Matching is by (type, name[, priority for MX]) so re-runs are idempotent.
 */
const DESIRED = [
  // — Website (Vercel) — must be DNS-only —
  { type: "A", name: "@", content: "76.76.21.21", proxied: false, ttl: 1 },
  { type: "CNAME", name: "www", content: "cname.vercel-dns.com", proxied: false, ttl: 1 },

  // — Inbound mail: keep STRATO inboxes working —
  { type: "MX", name: "@", content: "smtpin.rzone.de", priority: 5, ttl: 1 },

  // — Resend / Amazon SES bounce handling on the `send` subdomain —
  { type: "MX", name: "send", content: "feedback-smtp.eu-west-1.amazonses.com", priority: 10, ttl: 1 },
  { type: "TXT", name: "send", content: "v=spf1 include:amazonses.com ~all", ttl: 1 },

  // — DKIM for Resend (byte-perfect copy of the live value) —
  {
    type: "TXT",
    name: "resend._domainkey",
    content:
      "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCyZUh6zfyk2bndQ950ha/yaUi9KkJOUFTmQw2yDacDDoyzdGydijqx8YENFuypig+bpchyqwbyc7UzrcSzvH6ugvSJVqu0ro1J1wjecd7Y30lf1chMmbIKlSVBQ1xfmE8E4glXqn53NpGDZxY5qCI7p+Vcj0vgvsfb4E7hP3NLDwIDAQAB",
    ttl: 1,
  },

  // — DMARC (unchanged) —
  { type: "TXT", name: "_dmarc", content: "v=DMARC1;p=reject;", ttl: 1 },

  // — Mail-client autoconfiguration (STRATO) — keeps Outlook/Thunderbird auto-setup working —
  { type: "CNAME", name: "autoconfig", content: "autoconfigure.strato.de", proxied: false, ttl: 1 },
  { type: "SRV", name: "_autodiscover._tcp", data: { priority: 0, weight: 100, port: 443, target: "autoconfigure.strato.de" }, ttl: 1 },
];

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
  if (!json.success) {
    throw new Error(`CF ${path} failed: ${JSON.stringify(json.errors)}`);
  }
  return json;
}

/** Normalise a hostname for comparison (Cloudflare returns FQDNs, drops trailing dot). */
function fqdn(name) {
  if (name === "@") return ZONE_NAME;
  return name.endsWith(ZONE_NAME) ? name : `${name}.${ZONE_NAME}`;
}

function sameContent(existing, desired) {
  const ec = (existing.content || "").replace(/\.$/, "").toLowerCase();
  if (desired.type === "SRV") {
    const d = desired.data;
    return (
      existing.data?.port === d.port &&
      (existing.data?.target || "").replace(/\.$/, "").toLowerCase() ===
        d.target.toLowerCase() &&
      existing.data?.priority === d.priority &&
      existing.data?.weight === d.weight
    );
  }
  const dc = (desired.content || "").replace(/\.$/, "").toLowerCase();
  const contentOk = ec === dc;
  const prioOk = desired.priority === undefined || existing.priority === desired.priority;
  const proxyOk = desired.proxied === undefined || existing.proxied === desired.proxied;
  return contentOk && prioOk && proxyOk;
}

function payload(d) {
  const base = { type: d.type, name: fqdn(d.name), ttl: d.ttl ?? 1 };
  if (d.type === "SRV") return { ...base, data: d.data };
  const p = { ...base, content: d.content };
  if (d.priority !== undefined) p.priority = d.priority;
  if (d.proxied !== undefined) p.proxied = d.proxied;
  return p;
}

async function main() {
  const zoneRes = await cf(`/zones?name=${ZONE_NAME}`);
  const zone = zoneRes.result[0];
  if (!zone) {
    console.error(`Zone ${ZONE_NAME} not found on this Cloudflare account yet.`);
    console.error("Add the site in the Cloudflare dashboard first, then re-run.");
    process.exit(1);
  }
  console.log(`Zone: ${zone.name}  (id ${zone.id})`);
  console.log(`Cloudflare nameservers for this zone:`);
  (zone.name_servers || []).forEach((ns) => console.log(`   → ${ns}`));
  console.log("");

  const existingRes = await cf(`/zones/${zone.id}/dns_records?per_page=200`);
  const existing = existingRes.result;

  for (const d of DESIRED) {
    const name = fqdn(d.name);
    const matches = existing.filter(
      (r) =>
        r.type === d.type &&
        r.name === name &&
        (d.type !== "MX" || r.priority === d.priority),
    );

    if (matches.length && matches.some((m) => sameContent(m, d))) {
      console.log(`✓ ${d.type.padEnd(5)} ${name}  (already correct)`);
      continue;
    }

    if (matches.length) {
      // Update the first matching record in place.
      const target = matches[0];
      if (DRY) {
        console.log(`~ ${d.type.padEnd(5)} ${name}  WOULD UPDATE → ${d.content ?? JSON.stringify(d.data)}`);
      } else {
        await cf(`/zones/${zone.id}/dns_records/${target.id}`, {
          method: "PUT",
          body: JSON.stringify(payload(d)),
        });
        console.log(`~ ${d.type.padEnd(5)} ${name}  UPDATED → ${d.content ?? JSON.stringify(d.data)}`);
      }
      continue;
    }

    if (DRY) {
      console.log(`+ ${d.type.padEnd(5)} ${name}  WOULD CREATE → ${d.content ?? JSON.stringify(d.data)}`);
    } else {
      await cf(`/zones/${zone.id}/dns_records`, {
        method: "POST",
        body: JSON.stringify(payload(d)),
      });
      console.log(`+ ${d.type.padEnd(5)} ${name}  CREATED → ${d.content ?? JSON.stringify(d.data)}`);
    }
  }

  console.log(`\n${DRY ? "Dry run complete — no changes made." : "Sync complete."}`);
  console.log("Once these are in place, change the STRATO nameservers to the two shown above.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
