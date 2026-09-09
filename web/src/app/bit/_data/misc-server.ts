import { createPublicClient } from "@/app/bit/_lib/supabase-public";
import { withTimeout } from "@/app/bit/_lib/with-timeout";

/**
 * CMS-Loader für FAQ, Team-Kontakte und Stellenanzeigen (Tabellen aus
 * 0005_bit_cms_complete.sql). Die Aufrufer übergeben ihren statischen
 * Fallback, damit die Seiten auch ohne Datenbank vollständig bleiben.
 */

export interface FaqItem {
  group: string;
  q: string;
  a: string;
}

export async function getCmsFaq(fallback: FaqItem[]): Promise<FaqItem[]> {
  return withTimeout<FaqItem[]>(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("bit_faq")
      .select("group_name,question,answer,sort_order")
      .order("sort_order");
    if (error || !data || data.length === 0) return fallback;
    return data.map((r) => ({ group: r.group_name, q: r.question, a: r.answer }));
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
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("bit_team")
      .select("name,role,phone,email,sort_order,css_only")
      .order("sort_order");
    if (error || !data || data.length === 0) return fallback;
    return data.map((r) => ({
      name: r.name,
      role: r.role,
      phone: r.phone,
      email: r.email,
      cssOnly: r.css_only,
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
}

export async function getCmsJobs(fallback: JobPosting[]): Promise<JobPosting[]> {
  return withTimeout<JobPosting[]>(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("bit_jobs")
      .select("slug,title,intro,body,tasks_title,tasks,closing,sort_order")
      .order("sort_order");
    if (error || !data || data.length === 0) return fallback;
    return data.map((r) => ({
      id: r.slug,
      title: r.title,
      intro: r.intro,
      text: (r.body ?? "").split(/\n\n+/).filter(Boolean),
      aufgabenTitel: r.tasks_title,
      aufgaben: r.tasks ?? [],
      schluss: r.closing,
    }));
  }, fallback);
}
