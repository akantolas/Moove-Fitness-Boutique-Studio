-- Profile contact fields + insert policy for edge-case signup

alter table public.profiles
  add column if not exists phone text,
  add column if not exists division text,
  add column if not exists notes text;

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
