# BFSG-Monitor — Scan Worker

Standalone Node/Express service that runs accessibility scans with Playwright +
[`@axe-core/playwright`](https://github.com/dequelabs/axe-core-npm) against
**WCAG 2.1 A/AA** and returns an aggregated result. Deployed separately from the
Next.js app (target: **Railway**, using the official Playwright Docker image).

> Part of BFSG-Monitor (canonical repo: `podbihis-sys/bfsg-monitor`). A
> monitoring/diagnostic tool — **not legal advice**.

## Endpoints

| Method | Path      | Auth                 | Body                          |
| ------ | --------- | -------------------- | ----------------------------- |
| `GET`  | `/health` | none                 | —                             |
| `POST` | `/scan`   | `x-worker-secret`    | `{ "url": string, "maxPages"?: number }` |

`POST /scan` crawls same-origin pages (up to `maxPages`, capped at 20; default 1
= homepage only), runs axe-core on each, and returns:

```jsonc
{
  "url": "https://example.com/",
  "score": 72,                       // 0–100 (100 = no detected issues)
  "totalIssues": 14,
  "counts": { "critical": 1, "serious": 3, "moderate": 5, "minor": 5 },
  "pagesScanned": 1,
  "pages": [ { "url": "...", "score": 72, "totalIssues": 14, "counts": {…} } ],
  "startedAt": "…",
  "finishedAt": "…"
}
```

The service is **stateless**: it returns results; the Next.js app persists them
to Supabase (free scans in Phase 3, queued full/monitor scans in Phase 6).

## Scoring & standard

`WCAG_TAGS` and `IMPACT_WEIGHTS` in `src/config.ts` mirror the web app's
`src/lib/constants.ts` — keep them in sync. Automated testing finds only
~30–40 % of WCAG issues; results always require manual review.

## Security

- `x-worker-secret` (timing-safe compare) on `/scan`.
- SSRF guard (`src/url.ts`): only public `http(s)` URLs; local/private hosts and
  the cloud metadata IP are rejected.

## Local development

```bash
cp .env.example .env          # set SCAN_WORKER_SECRET
npm install
npx playwright install chromium   # only needed locally (not in the Docker image)
npm run dev                   # tsx watch, http://localhost:8080
```

Smoke test:

```bash
curl -s localhost:8080/scan -H 'content-type: application/json' \
  -H "x-worker-secret: $SCAN_WORKER_SECRET" \
  -d '{"url":"https://example.com"}' | jq
```

## Deploy (Railway)

Build from the `Dockerfile` (Playwright image `v1.61.0-jammy`). Set
`SCAN_WORKER_SECRET`; Railway injects `PORT`.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run typecheck`
