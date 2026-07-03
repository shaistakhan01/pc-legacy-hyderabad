alter table public.staff_invites
  add column token uuid not null default gen_random_uuid() unique,
  add column expires_at timestamptz not null default (now() + interval '7 days');