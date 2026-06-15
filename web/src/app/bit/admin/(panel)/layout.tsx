import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Package, Plus, ExternalLink } from "lucide-react";
import { createClient } from "@/app/bit/_lib/supabase-server";

export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/bit/admin/login");
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/bit/admin/login");

  const { data: admin } = await supabase
    .from("bit_admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Kein Zugriff</h1>
          <p className="mt-2 text-sm text-slate-600">
            Das Konto <span className="font-medium">{user.email}</span> ist nicht als CMS-Bearbeiter
            freigeschaltet. Bitte einen Administrator um eine Einladung.
          </p>
          <form action={signOut} className="mt-6">
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Abmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/bit/admin" className="flex items-center gap-2 font-semibold text-slate-900">
              <Package className="h-5 w-5 text-[#1e4a7a]" /> BIT CMS
            </Link>
            <Link href="/bit/admin" className="text-sm font-medium text-slate-600 hover:text-[#1e4a7a]">
              Produkte
            </Link>
            <Link
              href="/bit/admin/produkte/neu"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-[#1e4a7a]"
            >
              <Plus className="h-4 w-4" /> Neu
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/bit" target="_blank" className="inline-flex items-center gap-1 text-slate-500 hover:text-[#1e4a7a]">
              <ExternalLink className="h-4 w-4" /> Website
            </Link>
            <span className="hidden text-slate-400 sm:inline">{user.email}</span>
            <form action={signOut}>
              <button className="inline-flex items-center gap-1 text-slate-500 hover:text-red-600">
                <LogOut className="h-4 w-4" /> Abmelden
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
