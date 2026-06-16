import type { ScanSummary } from "./scan-types";

/** Raised when the scan worker is unreachable, misconfigured, or returns 4xx/5xx. */
export class ScanWorkerError extends Error {}

/** Calls the scan worker's POST /scan endpoint. Server-side only. */
export async function requestScan(
  url: string,
  maxPages = 1,
): Promise<ScanSummary> {
  const base = process.env.SCAN_WORKER_URL;
  const secret = process.env.SCAN_WORKER_SECRET;

  if (!base || !secret) {
    throw new ScanWorkerError("Der Scan-Dienst ist derzeit nicht verfügbar.");
  }

  let res: Response;
  try {
    res = await fetch(`${base.replace(/\/$/, "")}/scan`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-worker-secret": secret,
      },
      body: JSON.stringify({ url, maxPages }),
      cache: "no-store",
    });
  } catch {
    throw new ScanWorkerError("Der Scan-Dienst ist derzeit nicht erreichbar.");
  }

  if (!res.ok) {
    throw new ScanWorkerError(`Der Scan ist fehlgeschlagen (Status ${res.status}).`);
  }

  return (await res.json()) as ScanSummary;
}
