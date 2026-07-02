-- ── profiles ─────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer'
    check (role in ('customer','staff','admin','super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── guests ───────────────────────────────────────────────────────────
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  id_proof_type text,
  id_proof_number text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ── bookings ─────────────────────────────────────────────────────────
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  guest_id uuid references public.guests(id),
  module_type text not null
    check (module_type in ('room','restaurant','banquet','conference')),
  reference_number text not null unique,
  status text not null default 'pending'
    check (status in ('pending','confirmed','checked_in','completed','cancelled')),
  total_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_owner_check check (user_id is not null or guest_id is not null)
);

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

create index idx_bookings_user_id on public.bookings(user_id);
create index idx_bookings_module_type on public.bookings(module_type);
create index idx_bookings_status on public.bookings(status);

-- ── payment_transactions ────────────────────────────────────────────
create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  gateway_reference text,
  status text not null default 'initiated'
    check (status in ('initiated','success','failed','refunded')),
  amount numeric(10,2) not null,
  method text,
  created_at timestamptz not null default now()
);

create index idx_payment_transactions_booking_id on public.payment_transactions(booking_id);

-- ── audit_logs ───────────────────────────────────────────────────────
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ── staff_invites ────────────────────────────────────────────────────
create table public.staff_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null check (role in ('staff','admin')),
  invited_by uuid references public.profiles(id),
  status text not null default 'pending'
    check (status in ('pending','accepted','revoked')),
  created_at timestamptz not null default now()
);