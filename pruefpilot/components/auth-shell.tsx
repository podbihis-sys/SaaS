import Link from "next/link";
import type { ReactNode } from "react";

/** Gebrandeter Rahmen für Login / Registrierung / Onboarding / Abo. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-6 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl animate-blob [animation-delay:4s]" />
      </div>
      <div className="relative w-full max-w-md">
        <Link href="/" className="mx-auto mb-6 flex w-fit items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L15 10" />
            </svg>
          </span>
          PrüfPilot
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
