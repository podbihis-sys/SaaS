# SaaS — Monorepo

Mehrere Teilprojekte:

- **pruefpilot/** — PrüfPilot (Next.js 15 App Router, TypeScript, Tailwind, Supabase, Stripe). Eigenständige App.
- **web/** — Next.js Web-App.
- **backend/** — FastAPI (Python, SQLAlchemy async).
- **mobile/** — Expo / React Native.
- **supabase/** — Postgres-Migrationen.

## Befehle

**pruefpilot/** (pnpm):
- Dev: `pnpm dev` · Build: `pnpm build` · Lint: `pnpm lint` · Typecheck: `pnpm typecheck` · Tests: `pnpm test` (Vitest)
- Migrationen liegen in `pruefpilot/supabase/migrations/`; Region Frankfurt (eu-central-1).

**web/** (pnpm): `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck`

**backend/** (Python/FastAPI): lokal über `uvicorn`/Makefile starten; Abhängigkeiten in `backend/pyproject.toml`.

## ECC (Everything Claude Code)

ECC ist für dieses Repo **dauerhaft aktiviert** — keine Neu-Initialisierung pro Chat nötig.

- Konfiguriert in `.claude/settings.json`: Marketplace `affaan-m/ecc` (`extraKnownMarketplaces`, `autoUpdate`) + `enabledPlugins: { "ecc@ecc": true }`.
- In jeder Claude-Code-Session, die diesem Repo-Ordner vertraut, lädt ECC automatisch (Agents, Skills `/ecc:*`, Hooks, Rules).
- ECC läuft als **Plugin** — Skills/Regeln werden NICHT ins Repo kopiert (kein Duplikat, kein Bloat).

## Konventionen

- Styling: Tailwind; modernes Designsystem (Pill-Buttons, Glas/Bento) in `pruefpilot/app/globals.css`.
- Vor Commits: in betroffenen Teilprojekten `typecheck`, `lint`, `build` grün halten.
