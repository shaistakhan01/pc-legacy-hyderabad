-- ── Enable RLS on every table ───────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.guests enable row level security;
alter table public.bookings enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.staff_invites enable row level security;
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.room_bookings enable row level security;
alter table public.room_rate_calendar enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.restaurant_reservations enable row level security;
alter table public.menu_items enable row level security;
alter table public.event_halls enable row level security;
alter table public.hall_add_ons enable row level security;
alter table public.banquet_bookings enable row level security;
alter table public.conference_rooms enable row level security;
alter table public.conference_bookings enable row level security;

-- ── Helper function ──────────────────────────────────────────────────
create or replace function public.is_staff_or_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff','admin','super_admin')
  );
$$;

-- ══════════════════════════════════════════════════════════════════
-- SELF-MANAGED: profiles
-- ══════════════════════════════════════════════════════════════════
create policy "profiles_select_own_or_staff"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff_or_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════════
-- STAFF-ENTERED: guests
-- ══════════════════════════════════════════════════════════════════
create policy "guests_staff_only"
  on public.guests for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

-- ══════════════════════════════════════════════════════════════════
-- PUBLIC READ / ADMIN WRITE
-- ══════════════════════════════════════════════════════════════════

-- room_types
create policy "room_types_public_select" on public.room_types for select using (true);
create policy "room_types_staff_insert" on public.room_types for insert with check (public.is_staff_or_admin());
create policy "room_types_staff_update" on public.room_types for update using (public.is_staff_or_admin());
create policy "room_types_staff_delete" on public.room_types for delete using (public.is_staff_or_admin());

-- rooms
create policy "rooms_public_select" on public.rooms for select using (true);
create policy "rooms_staff_insert" on public.rooms for insert with check (public.is_staff_or_admin());
create policy "rooms_staff_update" on public.rooms for update using (public.is_staff_or_admin());
create policy "rooms_staff_delete" on public.rooms for delete using (public.is_staff_or_admin());

-- room_rate_calendar
create policy "room_rate_calendar_public_select" on public.room_rate_calendar for select using (true);
create policy "room_rate_calendar_staff_insert" on public.room_rate_calendar for insert with check (public.is_staff_or_admin());
create policy "room_rate_calendar_staff_update" on public.room_rate_calendar for update using (public.is_staff_or_admin());
create policy "room_rate_calendar_staff_delete" on public.room_rate_calendar for delete using (public.is_staff_or_admin());

-- restaurant_tables
create policy "restaurant_tables_public_select" on public.restaurant_tables for select using (true);
create policy "restaurant_tables_staff_insert" on public.restaurant_tables for insert with check (public.is_staff_or_admin());
create policy "restaurant_tables_staff_update" on public.restaurant_tables for update using (public.is_staff_or_admin());
create policy "restaurant_tables_staff_delete" on public.restaurant_tables for delete using (public.is_staff_or_admin());

-- menu_items
create policy "menu_items_public_select" on public.menu_items for select using (true);
create policy "menu_items_staff_insert" on public.menu_items for insert with check (public.is_staff_or_admin());
create policy "menu_items_staff_update" on public.menu_items for update using (public.is_staff_or_admin());
create policy "menu_items_staff_delete" on public.menu_items for delete using (public.is_staff_or_admin());

-- event_halls
create policy "event_halls_public_select" on public.event_halls for select using (true);
create policy "event_halls_staff_insert" on public.event_halls for insert with check (public.is_staff_or_admin());
create policy "event_halls_staff_update" on public.event_halls for update using (public.is_staff_or_admin());
create policy "event_halls_staff_delete" on public.event_halls for delete using (public.is_staff_or_admin());

-- hall_add_ons
create policy "hall_add_ons_public_select" on public.hall_add_ons for select using (true);
create policy "hall_add_ons_staff_insert" on public.hall_add_ons for insert with check (public.is_staff_or_admin());
create policy "hall_add_ons_staff_update" on public.hall_add_ons for update using (public.is_staff_or_admin());
create policy "hall_add_ons_staff_delete" on public.hall_add_ons for delete using (public.is_staff_or_admin());

-- conference_rooms
create policy "conference_rooms_public_select" on public.conference_rooms for select using (true);
create policy "conference_rooms_staff_insert" on public.conference_rooms for insert with check (public.is_staff_or_admin());
create policy "conference_rooms_staff_update" on public.conference_rooms for update using (public.is_staff_or_admin());
create policy "conference_rooms_staff_delete" on public.conference_rooms for delete using (public.is_staff_or_admin());

-- ══════════════════════════════════════════════════════════════════
-- USER-OWNED: bookings (root table)
-- ══════════════════════════════════════════════════════════════════
create policy "bookings_select_own_or_staff"
  on public.bookings for select
  using (auth.uid() = user_id or public.is_staff_or_admin());

create policy "bookings_insert_own_or_staff"
  on public.bookings for insert
  with check (auth.uid() = user_id or public.is_staff_or_admin());

create policy "bookings_update_own_or_staff"
  on public.bookings for update
  using (auth.uid() = user_id or public.is_staff_or_admin());

-- ══════════════════════════════════════════════════════════════════
-- USER-OWNED: module detail tables
-- ══════════════════════════════════════════════════════════════════

-- room_bookings
create policy "room_bookings_select_owner_or_staff"
  on public.room_bookings for select
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));
create policy "room_bookings_insert_owner_or_staff"
  on public.room_bookings for insert
  with check (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));
create policy "room_bookings_update_owner_or_staff"
  on public.room_bookings for update
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));

-- restaurant_reservations
create policy "restaurant_reservations_select_owner_or_staff"
  on public.restaurant_reservations for select
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));
create policy "restaurant_reservations_insert_owner_or_staff"
  on public.restaurant_reservations for insert
  with check (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));
create policy "restaurant_reservations_update_owner_or_staff"
  on public.restaurant_reservations for update
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));

-- banquet_bookings
create policy "banquet_bookings_select_owner_or_staff"
  on public.banquet_bookings for select
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));
create policy "banquet_bookings_insert_owner_or_staff"
  on public.banquet_bookings for insert
  with check (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));
create policy "banquet_bookings_update_owner_or_staff"
  on public.banquet_bookings for update
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));

-- conference_bookings
create policy "conference_bookings_select_owner_or_staff"
  on public.conference_bookings for select
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));
create policy "conference_bookings_insert_owner_or_staff"
  on public.conference_bookings for insert
  with check (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));
create policy "conference_bookings_update_owner_or_staff"
  on public.conference_bookings for update
  using (exists (
    select 1 from public.bookings b
    where b.id = booking_id and (b.user_id = auth.uid() or public.is_staff_or_admin())
  ));

-- ══════════════════════════════════════════════════════════════════
-- ADMIN-ONLY: payment_transactions, audit_logs, staff_invites
-- ══════════════════════════════════════════════════════════════════
create policy "payment_transactions_staff_only"
  on public.payment_transactions for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

create policy "audit_logs_staff_only"
  on public.audit_logs for all
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

create policy "staff_invites_admin_only"
  on public.staff_invites for all
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','super_admin')
  ))
  with check (exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','super_admin')
  ));