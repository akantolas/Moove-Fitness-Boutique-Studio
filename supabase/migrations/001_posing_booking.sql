-- Move & Pose booking schema
-- Run in Supabase SQL Editor or via Supabase CLI

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.package_plans (
  key text primary key,
  name_en text not null,
  name_el text not null,
  sessions_total integer not null check (sessions_total > 0),
  period_days integer not null default 30,
  duration_minutes integer not null default 30,
  sort_order integer not null default 0
);

create table if not exists public.user_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_key text not null references public.package_plans (key),
  sessions_total integer not null,
  sessions_used integer not null default 0,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'expired', 'cancelled')),
  period_start timestamptz,
  period_end timestamptz,
  stripe_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create table if not exists public.posing_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slot_id uuid not null references public.availability_slots (id) on delete restrict,
  plan_key text not null references public.package_plans (key),
  user_package_id uuid references public.user_packages (id) on delete set null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'confirmed', 'cancelled', 'completed')),
  payment_email_sent_at timestamptz,
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists posing_bookings_slot_active_idx
  on public.posing_bookings (slot_id)
  where status not in ('cancelled');

create index if not exists availability_slots_start_idx on public.availability_slots (start_at);
create index if not exists posing_bookings_user_idx on public.posing_bookings (user_id);
create index if not exists user_packages_user_idx on public.user_packages (user_id);

insert into public.package_plans (key, name_en, name_el, sessions_total, period_days, duration_minutes, sort_order)
values
  ('single', '1 Posing Session', '1 Posing Session', 1, 30, 30, 1),
  ('sapphire', 'Sapphire', 'Sapphire', 2, 30, 30, 2),
  ('ruby', 'Ruby', 'Ruby', 4, 30, 30, 3),
  ('diamond', 'Diamond', 'Diamond', 4, 30, 40, 4)
on conflict (key) do update set
  name_en = excluded.name_en,
  name_el = excluded.name_el,
  sessions_total = excluded.sessions_total,
  period_days = excluded.period_days,
  duration_minutes = excluded.duration_minutes,
  sort_order = excluded.sort_order;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.package_plans enable row level security;
alter table public.user_packages enable row level security;
alter table public.availability_slots enable row level security;
alter table public.posing_bookings enable row level security;

create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id or public.is_admin());

create policy package_plans_read on public.package_plans
  for select using (true);

create policy user_packages_select on public.user_packages
  for select using (auth.uid() = user_id or public.is_admin());

create policy user_packages_insert_own on public.user_packages
  for insert with check (auth.uid() = user_id or public.is_admin());

create policy user_packages_update on public.user_packages
  for update using (auth.uid() = user_id or public.is_admin());

create policy slots_select on public.availability_slots
  for select using (true);

create policy slots_admin_all on public.availability_slots
  for all using (public.is_admin()) with check (public.is_admin());

create policy bookings_select on public.posing_bookings
  for select using (auth.uid() = user_id or public.is_admin());

create policy bookings_insert_own on public.posing_bookings
  for insert with check (auth.uid() = user_id);

create policy bookings_update on public.posing_bookings
  for update using (auth.uid() = user_id or public.is_admin());
