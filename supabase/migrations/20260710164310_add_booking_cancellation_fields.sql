alter table public.bookings
  add column cancelled_at timestamptz,
  add column cancelled_by uuid references public.profiles(id),
  add column cancellation_reason text,
  add column invoice_path text;