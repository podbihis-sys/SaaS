# Handwerk Mobile

Expo (SDK 52) React Native app for the Handwerk SaaS. TypeScript strict mode, Expo Router v4, NativeWind v4, Supabase Auth, FastAPI backend.

## Setup

```bash
cd mobile
npm install
cp .env.example .env  # set EXPO_PUBLIC_API_URL, EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
npm run start
```

## Scripts

- `npm run start` - Expo dev server
- `npm run ios` / `npm run android` - launch in simulators
- `npm run typecheck` - `tsc --noEmit` (strict)
- `npm run lint` - `expo lint`

## Environment

Defined in `.env.example` and consumed via `process.env.EXPO_PUBLIC_*`:

- `EXPO_PUBLIC_API_URL` - FastAPI base URL
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

## Architecture

- `app/` - Expo Router file-based routes. Keeps screens thin; logic lives in `src/`.
- `src/components/` - reusable UI primitives (NativeWind class names).
- `src/lib/api.ts` - fetch wrapper attaching the Supabase JWT plus `X-Company-Id`.
- `src/lib/api/*.ts` - typed endpoint clients (customers, inquiries, quotes, prices, ai).
- `src/lib/auth/context.tsx` - `AuthProvider` / `useAuth`. Loads `/api/v1/auth/me` after sign-in and persists active company in `expo-secure-store`.
- `src/lib/hooks/useCompany.ts` - convenience hook for the active membership.
- `src/theme/` - design tokens.

## Routes

- `/` - auth redirect
- `/(auth)/login`, `/(auth)/register`
- `/(tabs)` - bottom tab navigator (Dashboard, Anfragen, Angebote, Mehr)
- `/(tabs)/inquiries`, `/(tabs)/inquiries/new`, `/(tabs)/inquiries/[id]`
- `/(tabs)/quotes`, `/(tabs)/quotes/[id]`
- `/(tabs)/more`

## Assets

`assets/icon.png` is referenced by `app.json` but not committed. Add a 1024x1024 PNG (or any Expo-acceptable icon) before building for stores. Locally `expo start` will warn but still run.
