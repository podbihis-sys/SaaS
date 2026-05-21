# SaaS Web

Next.js 15 (App Router, TypeScript strict) frontend for the German craftsman SaaS.

## Stack

- Next.js 15 + React 19, App Router, Server Components
- TailwindCSS + shadcn/ui (Radix primitives)
- Supabase Auth (PKCE) via `@supabase/ssr`
- TanStack Query v5, TanStack Table v8
- React Hook Form + Zod
- next-themes (dark mode)

## Getting Started

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_URL
npm install
npm run dev
```

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run typecheck` — strict TS check
- `npm run lint` — eslint

## Layout

- `(auth)` — login, register, OAuth callback
- `(app)` — protected layout with sidebar, dashboard, customers, inquiries, quotes, prices, settings, team
- `lib/api/*` — typed fetch clients for the FastAPI backend (`NEXT_PUBLIC_API_URL`)
- `lib/supabase/*` — browser, server, middleware Supabase clients

## Conventions

- Server Components by default. `"use client"` only for interactivity.
- All API calls go through `lib/api/client.ts` which attaches `Authorization` and `X-Company-Id`.
- Active company id is stored in cookie `active_company_id`.
