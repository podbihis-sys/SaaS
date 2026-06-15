import Link from "next/link";
import { ResultBadge } from "@/components/result-badge";
import { categoryById, categoryName } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";
import { verdictFor, verdictMeta, type VerificationPayload } from "@/lib/verification";

export const dynamic = "force-dynamic";

const DATE = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" });
const DATETIME = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });
const fmt = (iso: string) => DATE.format(new Date(`${iso}T00:00:00`));

const TONE: Record<string, { wrap: string; seal: string; dueLabel: string }> = {
  valid: { wrap: "from-emerald-500 to-teal-600", seal: "text-emerald-50", dueLabel: "Gültig bis" },
  invalid: { wrap: "from-rose-500 to-red-600", seal: "text-rose-50", dueLabel: "Fällig am" },
  neutral: { wrap: "from-slate-500 to-slate-700", seal: "text-slate-50", dueLabel: "Nächste Prüfung" },
};

function Logo() {
  return (
    <Link href="/" className="mx-auto flex w-fit items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L15 10" /></svg>
      </span>
      PrüfPilot
    </Link>
  );
}

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("verify_device", { p_token: token });
  const payload = (data ?? null) as VerificationPayload | null;

  return (
    <main className="min-h-screen bg-mesh-light">
      <div className="mx-auto max-w-lg px-5 py-10">
        <Logo />
        {!payload ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-[0_10px_40px_-15px_rgba(2,6,23,0.15)] ring-1 ring-slate-200/70">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">Kein Prüfobjekt gefunden</h1>
            <p className="mt-2 text-sm text-slate-600">Dieser QR-Code ist ungültig oder das Etikett gehört zu keinem aktiven Gerät.</p>
          </div>
        ) : (
          (() => {
            const verdict = verdictFor(payload);
            const meta = verdictMeta(verdict);
            const tone = TONE[meta.tone];
            const category = categoryById(payload.category_id);
            return (
              <>
                <div className={`mt-8 overflow-hidden rounded-3xl bg-gradient-to-br ${tone.wrap} p-8 text-center text-white shadow-xl`}>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">Prüfstatus</p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight">{meta.label}</p>
                  <p className={`mt-2 text-sm ${tone.seal}`}>{meta.hint}</p>
                </div>

                <div className="mt-4 rounded-3xl bg-white p-6 shadow-[0_10px_40px_-15px_rgba(2,6,23,0.15)] ring-1 ring-slate-200/70">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">{payload.name}</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    {categoryName(payload.category_id)}{category ? ` · ${category.legalBasis}` : ""}
                  </p>
                  <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <dt className="text-xs uppercase tracking-wide text-slate-400">{tone.dueLabel}</dt>
                      <dd className="mt-1 font-semibold text-slate-800">{fmt(payload.next_due_date)}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <dt className="text-xs uppercase tracking-wide text-slate-400">Letzte Prüfung</dt>
                      <dd className="mt-1 flex items-center gap-2">
                        {payload.last_inspected_at ? (
                          <>
                            <span className="font-semibold text-slate-800">{fmt(payload.last_inspected_at)}</span>
                            {payload.last_result ? <ResultBadge result={payload.last_result} /> : null}
                          </>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                  <a
                    href={`/v/${token}/zertifikat`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-6 w-full"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m1 8H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l5 5v7a2 2 0 0 1-2 2z" /></svg>
                    Prüfnachweis als PDF
                  </a>
                </div>
              </>
            );
          })()
        )}
        <p className="mt-6 text-center text-xs text-slate-400">
          Verifiziert über PrüfPilot · Stand {DATETIME.format(new Date())}
        </p>
      </div>
    </main>
  );
}
