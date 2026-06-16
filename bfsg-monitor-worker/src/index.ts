import "dotenv/config";

import express from "express";
import { z } from "zod";

import { requireWorkerSecret } from "./auth";
import { PORT } from "./config";
import { HttpError } from "./errors";
import { runScan } from "./scanner";
import { assertPublicUrl } from "./url";

const app = express();
app.use(express.json({ limit: "100kb" }));

const ScanBody = z.object({
  url: z.string().min(1),
  maxPages: z.number().int().positive().max(20).optional(),
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/scan", requireWorkerSecret, async (req, res) => {
  try {
    const { url, maxPages } = ScanBody.parse(req.body);
    const target = assertPublicUrl(url);
    const summary = await runScan(target, maxPages ?? 1);
    res.json(summary);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "invalid_body", details: err.issues });
      return;
    }
    console.error("scan failed", err);
    res.status(500).json({ error: "scan_failed" });
  }
});

app.listen(PORT, () => {
  console.log(`bfsg-monitor scan worker listening on :${PORT}`);
});
