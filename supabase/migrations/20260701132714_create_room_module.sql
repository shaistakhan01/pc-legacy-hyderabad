create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  base_price numeric(10,2) not null,
  max_occupancy int not null,
  amenities text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null unique,
  floor int,
  room_type_id uuid not null references public.room_types(id),
  status text not null default 'available'
    check (status in ('available','occupied','maintenance'))
);

create table public.room_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  room_id uuid not null references public.rooms(id),
  check_in date not null,
  check_out date not null,
  num_guests int not null default 1,
  special_requests text,
  constraint room_bookings_dates_check check (check_out > check_in)
);

create index idx_room_bookings_room_id on public.room_bookings(room_id);
create index idx_room_bookings_dates on public.room_bookings(check_in, check_out);

create table public.room_rate_calendar (
  id uuid primary key default gen_random_uuid(),
  room_type_id uuid not null references public.room_types(id),
  date date not null,
  rate_override numeric(10,2) not null,
  unique (room_type_id, date)
);