-- Abrechnungsfelder direkt am Betrieb (eine Preisstufe, ein Abo je Betrieb).
alter table companies
    add column stripe_customer_id text unique,
    add column stripe_subscription_id text,
    add column subscription_status text not null default 'trialing',
    add column trial_ends_at timestamptz not null default now() + interval '14 days';
