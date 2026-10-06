import { query } from "@/app/bit/_lib/db";
import { TeamEditor } from "../../_components/team-editor";
import type { TeamListInput } from "../../_actions";

export const dynamic = "force-dynamic";

interface TeamRow {
  name: string;
  role: string;
  phone: string;
  email: string;
  css_only: number | boolean;
}

export default async function TeamAdmin() {
  let data: TeamRow[] = [];
  try {
    data = await query<TeamRow>(
      "SELECT name,role,phone,email,css_only FROM bit_team ORDER BY sort_order",
    );
  } catch {
    data = [];
  }
  const rows: TeamListInput = data.map((r) => ({
    name: r.name,
    role: r.role,
    phone: r.phone,
    email: r.email,
    css_only: Boolean(r.css_only),
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
