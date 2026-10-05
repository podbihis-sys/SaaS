import { query, parseJsonColumn } from "@/app/bit/_lib/db";
import { withTimeout } from "@/app/bit/_lib/with-timeout";

/**
 * CMS-Loader für FAQ, Team-Kontakte und Stellenanzeigen (MariaDB). Die Aufrufer
 * übergeben ihren statischen Fallback, damit die Seiten auch ohne Datenbank
 * vollständig bleiben.
 *
 * Oeffentliche Reads: nur status='published' (ersetzt die fruehere RLS).
 */

export interface FaqItem {
  group: string;
  q: string;
  a: string;
}

export async function getCmsFaq(fallback: FaqItem[]): Promise<FaqItem[]> {
  return withTimeout<FaqItem[]>(async () => {
    const rows = await query<{ group_name: string; question: string; answer: string }>(
      "SELECT group_name,question,answer FROM bit_faq WHERE status = 'published' ORDER BY sort_order",
    );
    if (rows.length === 0) return fallback;
    return rows.map((r) => ({ group: r.group_name, q: r.question, a: r.answer }));
  }, fallback);
}

export interface TeamMember {
  name: string;
  role: string;
  phone: string;
  email: string;
  cssOnly: boolean;
}

export async function getCmsTeam(fallback: TeamMember[]): Promise<TeamMember[]> {
  return withTimeout<TeamMember[]>(async () => {
    const rows = await query<{
      name: string;
      role: string;
      phone: string;
      email: string;
      css_only: number | boolean;
    }>(
      "SELECT name,role,phone,email,css_only FROM bit_team WHERE status = 'published' ORDER BY sort_order",
    );
    if (rows.length === 0) return fallback;
    return rows.map((r) => ({
      name: r.name,
      role: r.role,
      phone: r.phone,
      email: r.email,
      cssOnly: Boolean(r.css_only),
    }));
  }, fallback);
}

export interface JobPosting {
  id: string;
  title: string;
  intro: string;
  text: string[];
  aufgabenTitel: string;
  aufgaben: string[];
  schluss: string;
  /** Englische Fassung (CMS oder jobs.ts); fehlt sie, bleibt die Stelle deutsch. */
  titleEn?: string;
  introEn?: string;
  textEn?: string[];
  aufgabenTitelEn?: string;
  aufgabenEn?: string[];
  schlussEn?: string;
}

/** Stelle in der gewünschten Sprache (EN fällt je Feld auf Deutsch zurück). */
export function localizeJob(job: JobPosting, locale: "de" | "en"): JobPosting {
  if (locale === "de") return job;
  return {
    ...job,
    title: job.titleEn || job.title,
    intro: job.introEn || job.intro,
    text: job.textEn?.length ? job.textEn : job.text,
    aufgabenTitel: job.aufgabenTitelEn || job.aufgabenTitel,
    aufgaben: job.aufgabenEn?.length ? job.aufgabenEn : job.aufgaben,
    schluss: job.schlussEn || job.schluss,
  };
}

/**
 * Aktuell ausgeschriebene Stellen – vorerst nur "Vertrieb".
 * Zentral gefiltert, weil die Liste auch aus dem CMS (bit_jobs) kommen kann.
 */
export const ACTIVE_JOB_IDS = new Set<string>(["vertrieb"]);

export async function getActiveJobs(fallback: JobPosting[]): Promise<JobPosting[]> {
  const jobs = await getCmsJobs(fallback);
  return jobs.filter((job) => ACTIVE_JOB_IDS.has(job.id));
}

interface JobRow {
  slug: string;
  title: string;
  intro: string;
  body: string | null;
  tasks_title: string;
  tasks: unknown;
  closing: string;
  title_en: string | null;
  intro_en: string | null;
  body_en: string | null;
  tasks_title_en: string | null;
  tasks_en: unknown;
  closing_en: string | null;
}

export async function getCmsJobs(fallback: JobPosting[]): Promise<JobPosting[]> {
  return withTimeout<JobPosting[]>(async () => {
    const rows = await query<JobRow>(
      "SELECT slug,title,intro,body,tasks_title,tasks,closing,title_en,intro_en,body_en,tasks_title_en,tasks_en,closing_en FROM bit_jobs WHERE status = 'published' ORDER BY sort_order",
    );
    if (rows.length === 0) return fallback;
    return rows.map((r) => {
      const tasksEnRaw = parseJsonColumn<string[] | null>(r.tasks_en, []);
      return {
        id: r.slug,
        title: r.title,
        intro: r.intro,
        text: (r.body ?? "").split(/\n\n+/).filter(Boolean),
        aufgabenTitel: r.tasks_title,
        aufgaben: parseJsonColumn<string[]>(r.tasks, []),
        schluss: r.closing,
        titleEn: r.title_en ?? fallback.find((f) => f.id === r.slug)?.titleEn,
        introEn: r.intro_en ?? fallback.find((f) => f.id === r.slug)?.introEn,
        textEn: r.body_en
          ? r.body_en.split(/\n\n+/).filter(Boolean)
          : fallback.find((f) => f.id === r.slug)?.textEn,
        aufgabenTitelEn: r.tasks_title_en ?? fallback.find((f) => f.id === r.slug)?.aufgabenTitelEn,
        aufgabenEn: tasksEnRaw && tasksEnRaw.length
          ? tasksEnRaw
          : fallback.find((f) => f.id === r.slug)?.aufgabenEn,
        schlussEn: r.closing_en ?? fallback.find((f) => f.id === r.slug)?.schlussEn,
      };
    });
  }, fallback);
}
