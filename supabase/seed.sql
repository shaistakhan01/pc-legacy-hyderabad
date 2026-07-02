-- Development seed data — NOT for production.

-- ── Room Types & Rooms ───────────────────────────────────────────────
insert into public.room_types (name, description, base_price, max_occupancy, amenities)
values
  ('Deluxe Room', 'Spacious room with city view and modern amenities.', 4500.00, 2, array['WiFi','AC','TV','Mini Fridge']),
  ('Executive Suite', 'Premium suite with separate living area.', 8500.00, 3, array['WiFi','AC','TV','Mini Bar','Balcony']),
  ('Standard Room', 'Comfortable and affordable stay option.', 3200.00, 2, array['WiFi','AC','TV'])
on conflict do nothing;

insert into public.rooms (room_number, floor, room_type_id, status)
select room_number, floor, rt.id, 'available'
from (values
  ('101', 1, 'Standard Room'),
  ('102', 1, 'Standard Room'),
  ('201', 2, 'Deluxe Room'),
  ('202', 2, 'Deluxe Room'),
  ('301', 3, 'Executive Suite')
) as r(room_number, floor, type_name)
join public.room_types rt on rt.name = r.type_name
on conflict (room_number) do nothing;

-- ── Restaurant Tables & Menu ─────────────────────────────────────────
insert into public.restaurant_tables (table_number, capacity, location_zone, status)
values
  ('T1', 2, 'Window', 'available'),
  ('T2', 4, 'Main Hall', 'available'),
  ('T3', 4, 'Main Hall', 'available'),
  ('T4', 6, 'Patio', 'available'),
  ('T5', 8, 'Private Room', 'available')
on conflict (table_number) do nothing;

insert into public.menu_items (name, description, price, category, image_url)
values
  ('Butter Chicken', 'Classic creamy tomato-based curry with tender chicken.', 420.00, 'Main Course', null),
  ('Paneer Tikka', 'Grilled cottage cheese marinated in spiced yogurt.', 340.00, 'Starters', null),
  ('Hyderabadi Biryani', 'Signature slow-cooked rice dish with aromatic spices.', 480.00, 'Main Course', null),
  ('Gulab Jamun', 'Warm milk-solid dumplings in sugar syrup.', 150.00, 'Dessert', null)
on conflict do nothing;

-- ── Event Halls & Add-ons ────────────────────────────────────────────
insert into public.event_halls (name, capacity_min, capacity_max, base_price, layout_options)
values
  ('Grand Ballroom', 100, 500, 150000.00, array['Theatre','Banquet','U-Shape']),
  ('Garden Pavilion', 50, 200, 85000.00, array['Banquet','Cocktail']),
  ('Heritage Hall', 30, 120, 55000.00, array['Boardroom','Theatre'])
on conflict do nothing;

insert into public.hall_add_ons (name, price, category)
values
  ('Standard Catering (per plate)', 900.00, 'catering'),
  ('Premium Catering (per plate)', 1500.00, 'catering'),
  ('Floral Decoration Package', 25000.00, 'decoration'),
  ('AV & Sound System', 18000.00, 'av_equipment')
on conflict do nothing;

-- ── Conference Rooms ─────────────────────────────────────────────────
insert into public.conference_rooms (name, capacity, hourly_rate, equipment)
values
  ('Boardroom A', 12, 2500.00, array['Projector','Whiteboard','Video Conferencing']),
  ('Boardroom B', 8, 1800.00, array['TV Screen','Whiteboard']),
  ('Innovation Lab', 20, 3500.00, array['Projector','Video Conferencing','Sound System'])
on conflict do nothing;