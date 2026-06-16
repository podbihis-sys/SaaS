-- 0003_free_scans.sql
--
-- Public free scans (Phase 3) have no authenticated user and no saved domain.
-- Allow `scans` rows without a user, and store the scanned URL directly so the
-- public result page can render it. Free-scan rows are read server-side via the
-- service role; the owner-only SELECT policy keeps them invisible to clients.
alter table public.scans alter column user_id drop not null;
alter table public.scans add column if not exists target_url text;
