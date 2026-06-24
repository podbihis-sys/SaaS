import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { WORKER_SECRET } from "./config";

/** Authenticates callers via the shared `x-worker-secret` header. */
export function requireWorkerSecret(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const provided = req.header("x-worker-secret") ?? "";

  if (!WORKER_SECRET || !safeEqual(provided, WORKER_SECRET)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  next();
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
