import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Package, ExternalLink } from "lucide-react";
import { getSessionAdmin } from "@/app/bit/_lib/auth";
import { logoutAction } from "@/app/bit/admin/_auth-actions";

export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  await logoutAction();
  redirect("/bit/admin/login");
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Eine gueltige Session + vorhandene Admin-Zeile IST die Freischaltung;
  // fehlt sie, zurueck zur Anmeldung (kein separater "Kein Zugriff"-Screen,
  // da es keine Whitelist getrennt von der Kontozeile mehr gibt).
  const admin = await getSessionAdmin();
  if (!admin) redirect("/bit/admin/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/bit/admin" className="flex items-center gap-2 font-semibold text-slate-900">
              <Package className="h-5 w-5 text-[#1e4a7a]" /> BIT CMS
            </Link>
            {[
              ["/bit/admin", "Produkte"],
              ["/bit/admin/kategorien", "Kategorien"],
              ["/bit/admin/news", "News"],
              ["/bit/admin/seiten", "Unterseiten"],
              ["/bit/admin/faq", "FAQ"],
              ["/bit/admin/team", "Team"],
              ["/bit/admin/stellen", "Stellen"],
              ["/bit/admin/inhalte", "Texte"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href!}
                className="text-sm font-medium text-slate-600 hover:text-[#1e4a7a]"
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/bit" target="_blank" className="inline-flex items-center gap-1 text-slate-500 hover:text-[#1e4a7a]">
              <ExternalLink className="h-4 w-4" /> Website
            </Link>
            <span className="hidden text-slate-400 sm:inline">{admin.email}</span>
            <form action={signOut}>
              <button className="inline-flex items-center gap-1 text-slate-500 hover:text-red-600">
                <LogOut className="h-4 w-4" /> Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
