# Architecture

## High-level components

```mermaid
flowchart LR
    W[Next.js Web] -->|HTTPS + JWT| API
    M[Expo Mobile] -->|HTTPS + JWT| API
    API[FastAPI /api/v1] --> DB[(Postgres / Supabase)]
    API --> STORAGE[(Supabase Storage)]
    API --> AI[AI Service]
    AI --> OPENAI[(OpenAI Vision)]
    W -.-> AUTH[(Supabase Auth)]
    M -.-> AUTH
    API -.->|verify JWT| AUTH
```

## Request flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (web/mobile)
    participant SB as Supabase Auth
    participant API as FastAPI
    participant DB as Postgres
    U->>C: Sign in
    C->>SB: Email + password / OAuth
    SB-->>C: JWT (sub = user_id, claims)
    C->>API: GET /api/v1/inquiries (Bearer JWT)
    API->>API: Verify JWT, resolve company_id via memberships
    API->>DB: SELECT ... WHERE company_id = :cid
    DB-->>API: rows
    API-->>C: JSON list
```

## Inquiry to quote

```mermaid
sequenceDiagram
    participant C as Client
    participant API as FastAPI
    participant ST as Storage
    participant AI as AI Service
    C->>API: POST /inquiries
    C->>API: POST /inquiries/:id/images (multipart)
    API->>ST: store object
    API->>AI: analyze(inquiry_id)
    AI->>AI: call OpenAI vision
    AI->>API: ai_analysis row
    C->>API: POST /quotes from inquiry_id
    API->>API: match detected services to price_items
    API-->>C: Quote with positions (needs_pricing flag where unmatched)
```

## Layers (backend)

- `app/api/v1`: FastAPI routers, request/response Pydantic schemas.
- `app/services`: business logic, orchestration, AI orchestration.
- `app/repositories`: SQLAlchemy queries, tenant-scoped.
- `app/models`: ORM models mirroring `supabase/migrations/0001_init.sql`.
- `app/core`: settings, auth, logging, db session.

## Frontend

- `web/` is a Next.js App Router app. Server Components call the API via fetch with the user's JWT forwarded from a Route Handler proxy or via Supabase session cookies.
- `mobile/` is an Expo app sharing DTOs from `shared/types/api.ts`.
