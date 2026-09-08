import { createClient } from "@/app/bit/_lib/supabase-server";
import { TeamEditor } from "../../_components/team-editor";
import type { TeamListInput } from "../../_actions";

export const dynamic = "force-dynamic";

export default async function TeamAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bit_team")
    .select("name,role,phone,email,sort_order,css_only")
    .order("sort_order");
  const rows: TeamListInput = (data ?? []).map((r) => ({
    name: r.name,
    role: r.role,
    phone: r.phone,
    email: r.email,
    css_only: r.css_only,
  }));
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Team / Ansprechpartner</h1>
      <p className="mt-1 text-sm text-slate-500">
        Kontakte der Kontaktseite. „Nicht indexierbar“ blendet Telefon/E-Mail für Suchmaschinen aus.
      </p>
      <div className="mt-6">
        <TeamEditor initial={rows} />
      </div>
    </>
  );
}
