create table public.event_halls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity_min int,
  capacity_max int,
  base_price numeric(10,2) not null,
  layout_options text[] not null default '{}'
);

create table public.hall_add_ons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null,
  category text check (category in ('catering','decoration','av_equipment'))
);

create table public.banquet_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  hall_id uuid not null references public.event_halls(id),
  event_date date not null,
  start_time time not null,
  end_time time not null,
  event_type text,
  guest_count int,
  add_on_ids uuid[] not null default '{}',
  constraint banquet_bookings_time_check check (end_time > start_time)
);

create index idx_banquet_bookings_hall_date on public.banquet_bookings(hall_id, event_date);