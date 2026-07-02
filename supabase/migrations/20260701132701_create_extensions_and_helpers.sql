-- Postgres 13+ has gen_random_uuid() natively via pgcrypto.
create extension if not exists "pgcrypto";

-- Generic updated_at trigger function — reused by every table that has
-- an updated_at column. Keeps "last modified" accurate without relying
-- on application code to remember to set it.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;