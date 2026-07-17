create table public.menu_sections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('buffet', 'a_la_carte')),
  icon text,                    -- emoji, e.g. 🍳
  description text,
  price numeric(10,2),          -- per-person buffet price; null for a_la_carte
  timing_text text,             -- e.g. "7:00 AM – 10:30 AM"
  availability_text text,       -- e.g. "Available Daily" or "Fri, Sat, Sun"
  is_enabled boolean not null default true,
  sort_order int not null default 0
);

alter table public.menu_items
  add column section_id uuid references public.menu_sections(id),
  add column is_available boolean not null default true;

-- Public read (matches Phase 2.3's menu_items pattern) — anyone can see
-- enabled sections; admin write only.
alter table public.menu_sections enable row level security;

create policy "menu_sections_public_select"
  on public.menu_sections for select using (true);
create policy "menu_sections_staff_insert"
  on public.menu_sections for insert with check (public.is_staff_or_admin());
create policy "menu_sections_staff_update"
  on public.menu_sections for update using (public.is_staff_or_admin());
create policy "menu_sections_staff_delete"
  on public.menu_sections for delete using (public.is_staff_or_admin());

-- Seed the three sections
insert into public.menu_sections (name, type, icon, price, timing_text, availability_text, sort_order)
values
  ('Breakfast Buffet', 'buffet', '🍳', 2950, '7:00 AM – 10:30 AM', 'Available Daily', 1),
  ('Hi-Tea Buffet', 'buffet', '☕', 2500, '5:00 PM – 9:00 PM', 'Weekends Only — Fri, Sat, Sun', 2),
  ('Lunch & Dinner', 'a_la_carte', '🍽️', null, null, 'Available Daily', 3);

-- Move existing seeded items into the Lunch & Dinner section
update public.menu_items
set section_id = (select id from public.menu_sections where name = 'Lunch & Dinner');s