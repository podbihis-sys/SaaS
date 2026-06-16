-- ===========================================================================
-- RentFlow — 0002 Row Level Security (prompt §7)
-- Each tenant sees only its own rows (user_id = auth.uid()).
-- The public (unauthenticated) booking page does NOT read through the anon role;
-- it goes through a narrow service-role route (the service role bypasses RLS).
-- stripe_events and write-side booking operations are service-role only.
-- ===========================================================================

alter table public.profiles    enable row level security;
alter table public.items       enable row level security;
alter table public.item_blocks enable row level security;
alter table public.bookings    enable row level security;
alter table public.stripe_events enable row level security;

-- --- profiles --------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Insert is handled by the handle_new_user() trigger (security definer).
-- We still allow a self-insert as a safety net for the row's owner.
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = user_id);

-- --- items -----------------------------------------------------------------
drop policy if exists "items_all_own" on public.items;
create policy "items_all_own" on public.items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --- item_blocks -----------------------------------------------------------
drop policy if exists "item_blocks_all_own" on public.item_blocks;
create policy "item_blocks_all_own" on public.item_blocks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --- bookings --------------------------------------------------------------
-- Owners may read and manage their own bookings. Public booking creation runs
-- through the service role (create_booking_hold), not through the anon role,
-- so there is intentionally no anon insert policy here.
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = user_id);

drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own" on public.bookings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --- stripe_events ---------------------------------------------------------
-- No policies => only the service role (which bypasses RLS) can access it.
