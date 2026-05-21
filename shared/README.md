# shared

TypeScript types and constants imported by both `web/` and `mobile/`. The DTO interfaces here mirror the backend Pydantic schemas exposed under `/api/v1`. They are the single source of truth for the API contract on the client side.

## Layout

```
shared/
  types/
    api.ts        DTO interfaces for every resource returned by the API
    enums.ts      String-union enums shared between client and server
  constants/
    vat.ts        German VAT rates and helpers
    units.ts      Allowed unit codes used by price items and quote positions
```

## Conventions

- TypeScript strict, no `any`.
- All fields use the same names as the JSON payloads (snake_case).
- Timestamps are ISO 8601 strings.
- Monetary amounts are strings (so `numeric(12,2)` from Postgres round-trips losslessly).
- IDs are UUID v4 strings.

## Usage

Import directly from the package path. The web and mobile `tsconfig.json` add `shared/*` to `paths`.

```ts
import type { Quote, QuoteStatus } from "shared/types/api";
import { UNITS } from "shared/constants/units";
```
