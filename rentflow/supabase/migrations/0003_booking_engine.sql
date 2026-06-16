-- ===========================================================================
-- RentFlow — 0003 booking & availability engine (prompt §10)
-- The central invariant of the product. Availability checking + booking
-- creation are TRANSACTIONAL with a row lock, never plain application logic.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- check_availability(item, start, end) -> available units in [start,end].
-- Read-only helper for the public availability endpoint. NOT authoritative for
-- writes — create_booking_hold() re-checks under a row lock.
--
-- available = item.quantity
--             - sum(overlapping confirmed|active|live-pending bookings.quantity)
--             - count(overlapping item_blocks)
-- Overlap uses inclusive dateranges: daterange(s, e, '[]') && daterange(rs, re, '[]')
-- ---------------------------------------------------------------------------
create or replace function public.check_availability(
  p_item_id    uuid,
  p_start_date date,
  p_end_date   date
)
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_quantity int;
  v_used     int;
  v_blocked  int;
  v_req      daterange := daterange(p_start_date, p_end_date, '[]');
begin
  if p_start_date > p_end_date then
    raise exception 'invalid_date_range' using errcode = '22023';
  end if;

  select quantity into v_quantity from public.items where id = p_item_id and active;
  if v_quantity is null then
    return 0;  -- unknown or inactive item => nothing bookable
  end if;

  select coalesce(sum(b.quantity), 0) into v_used
  from public.bookings b
  where b.item_id = p_item_id
    and daterange(b.start_date, b.end_date, '[]') && v_req
    and (
      b.status in ('confirmed', 'active')
      or (b.status = 'pending' and b.hold_expires_at > now())
    );

  select count(*) into v_blocked
  from public.item_blocks ib
  where ib.item_id = p_item_id
    and daterange(ib.start_date, ib.end_date, '[]') && v_req;

  return greatest(v_quantity - v_used - v_blocked, 0);
end;
$$;

-- ---------------------------------------------------------------------------
-- create_booking_hold(...) -> bookings row (status = 'pending')
-- THE transactional invariant (prompt §10):
--   1. row-lock the item (SELECT ... FOR UPDATE) -> serializes concurrent
--      attempts for the same item; the second waits for the first to commit.
--   2. re-count overlapping usage *inside* the transaction.
--   3. if available, insert a pending hold with a TTL.
--   4. commit. Caller then creates the Connect checkout.
-- Raises 'not_available' (errcode 23P01) when capacity is insufficient. For
-- single-unit items the no_overlap_qty1 EXCLUDE constraint is the backstop.
-- ---------------------------------------------------------------------------
create or replace function public.create_booking_hold(
  p_item_id        uuid,
  p_start_date     date,
  p_end_date       date,
  p_quantity       int,
  p_customer_name  text,
  p_customer_email text,
  p_customer_phone text default null,
  p_hold_minutes   int default 15
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item    public.items;
  v_used    int;
  v_blocked int;
  v_avail   int;
  v_booking public.bookings;
  v_req     daterange := daterange(p_start_date, p_end_date, '[]');
begin
  if p_start_date > p_end_date then
    raise exception 'invalid_date_range' using errcode = '22023';
  end if;
  if coalesce(p_quantity, 0) < 1 then
    raise exception 'invalid_quantity' using errcode = '22023';
  end if;

  -- 1. Lock the item row. Concurrent create_booking_hold() calls for the same
  --    item now serialize here; the loser sees the winner's pending hold.
  select * into v_item from public.items where id = p_item_id for update;
  if not found then
    raise exception 'item_not_found' using errcode = 'P0002';
  end if;
  if not v_item.active then
    raise exception 'item_inactive' using errcode = '22023';
  end if;

  -- 2. Re-count overlapping usage inside the locked transaction.
  select coalesce(sum(b.quantity), 0) into v_used
  from public.bookings b
  where b.item_id = p_item_id
    and daterange(b.start_date, b.end_date, '[]') && v_req
    and (
      b.status in ('confirmed', 'active')
      or (b.status = 'pending' and b.hold_expires_at > now())
    );

  select count(*) into v_blocked
  from public.item_blocks ib
  where ib.item_id = p_item_id
    and daterange(ib.start_date, ib.end_date, '[]') && v_req;

  v_avail := v_item.quantity - v_used - v_blocked;
  if v_avail < p_quantity then
    raise exception 'not_available' using errcode = '23P01';
  end if;

  -- 3. Insert the pending hold. Totals are computed here for integrity and
  --    mirror the pure calcRentalPrice() in the app (days inclusive).
  insert into public.bookings (
    user_id, item_id, customer_name, customer_email, customer_phone,
    start_date, end_date, quantity, status,
    rental_total, deposit_total, hold_expires_at, is_unique
  )
  values (
    v_item.user_id, p_item_id, p_customer_name, p_customer_email, p_customer_phone,
    p_start_date, p_end_date, p_quantity, 'pending',
    (p_end_date - p_start_date + 1) * v_item.price_per_day * p_quantity,
    v_item.deposit_amount * p_quantity,
    now() + make_interval(mins => p_hold_minutes),
    (v_item.quantity = 1)
  )
  returning * into v_booking;

  return v_booking;  -- 4. commit happens when the RPC transaction commits
end;
$$;

-- ---------------------------------------------------------------------------
-- expire_holds() -> number of expired holds. Called by /api/cron/expire-holds.
-- Frees slots whose pending TTL has elapsed.
-- ---------------------------------------------------------------------------
create or replace function public.expire_holds()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.bookings
  set status = 'expired'
  where status = 'pending'
    and hold_expires_at is not null
    and hold_expires_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Booking RPCs are invoked exclusively via the service role from server routes.
revoke all on function public.create_booking_hold(uuid, date, date, int, text, text, text, int) from public, anon, authenticated;
revoke all on function public.expire_holds() from public, anon, authenticated;
