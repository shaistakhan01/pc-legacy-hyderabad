create table public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  table_number text not null unique,
  capacity int not null,
  location_zone text,
  status text not null default 'available'
    check (status in ('available','occupied','reserved'))
);

create table public.restaurant_reservations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  table_id uuid references public.restaurant_tables(id),
  reservation_date date not null,
  reservation_time time not null,
  party_size int not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','seated','completed','cancelled'))
);

create index idx_restaurant_reservations_date_time
  on public.restaurant_reservations(reservation_date, reservation_time);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text,
  image_url text
);