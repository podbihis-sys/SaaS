import { NextRequest, NextResponse } from "next/server";
import { analyzeSite, type SiteAnalysis } from "@/lib/scraper";
import {
  buildQuote,
  type Country,
  type LeadInput,
  type MaintenanceChoice,
  type PagesScope,
  type ProjectType,
} from "@/lib/quote";
import { sendEmails } from "@/lib/notify";

export const runtime = "nodejs";
export const maxDuration = 30;

const PROJECT_TYPES: ProjectType[] = ["new", "redesign", "shop", "landing", "seo"];
const PAGES: PagesScope[] = ["small", "medium", "large"];
const LANGS = ["one", "two", "many"] as const;
const MAINTENANCE: MaintenanceChoice[] = ["none", "basic", "business", "premium", "unsure"];
const COUNTRIES: Country[] = ["de", "at", "ch", "hr", "ba", "rs", "me", "other"];

// Naive in-memory rate limit per instance (Vercel serverless: best effort).
const hits = new Map<string, { count: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 5;
}

function str(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const lead: LeadInput = {
    name: str(body.name, 120),
    email: str(body.email, 200),
    phone: str(body.phone, 60),
    company: str(body.company, 200),
    address: str(body.address, 300),
    country: COUNTRIES.includes(body.country as Country) ? (body.country as Country) : "other",
    hasWebsite: body.hasWebsite === true,
    websiteUrl: str(body.websiteUrl, 500),
    projectType: PROJECT_TYPES.includes(body.projectType as ProjectType)
      ? (body.projectType as ProjectType)
      : "new",
    pages: PAGES.includes(body.pages as PagesScope) ? (body.pages as PagesScope) : "small",
    languages: LANGS.includes(body.languages as (typeof LANGS)[number])
      ? (body.languages as (typeof LANGS)[number])
      : "one",
    maintenance: MAINTENANCE.includes(body.maintenance as MaintenanceChoice)
      ? (body.maintenance as MaintenanceChoice)
      : "unsure",
    message: str(body.message, 3000),
    locale: str(body.locale, 5) || "de",
  };

  if (!lead.name || !lead.email || !lead.company || !lead.address) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (lead.hasWebsite && !lead.websiteUrl) {
    return NextResponse.json({ error: "missing_url" }, { status: 400 });
  }

  let analysis: SiteAnalysis | null = null;
  if (lead.hasWebsite && lead.websiteUrl) {
    analysis = await analyzeSite(lead.websiteUrl);
  }

  const quote = buildQuote(lead, analysis);
  const emailSent = await sendEmails(lead, quote, analysis);

  console.log(
    JSON.stringify({
      type: "lead",
      at: new Date().toISOString(),
      company: lead.company,
      email: lead.email,
      country: lead.country,
      projectType: lead.projectType,
      total: [quote.totalMin, quote.totalMax],
      emailSent,
    }),
  );

  return NextResponse.json({ quote, analysis, emailSent });
}
