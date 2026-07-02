create table public.conference_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity int not null,
  hourly_rate numeric(10,2) not null,
  equipment text[] not null default '{}'
);

create table public.conference_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  room_id uuid not null references public.conference_rooms(id),
  date date not null,
  start_time time not null,
  end_time time not null,
  purpose text,
  attendee_count int,
  catering_required boolean not null default false,
  constraint conference_bookings_time_check check (end_time > start_time)
);

create index idx_conference_bookings_room_date on public.conference_bookings(room_id, date);