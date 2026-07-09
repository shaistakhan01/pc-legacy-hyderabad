alter table public.guests
  add column notes text,
  add column tags text[] not null default '{}';