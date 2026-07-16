-- Per-client custom prices per package plan (admin-managed)

create table if not exists public.profile_plan_prices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_key text not null references public.package_plans (key) on delete cascade,
  price_eur integer not null check (price_eur > 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_key)
);

create index if not exists profile_plan_prices_user_idx on public.profile_plan_prices (user_id);

alter table public.profile_plan_prices enable row level security;

-- No client policies: only service role / admin API access

alter table public.posing_bookings
  add column if not exists amount_eur integer check (amount_eur is null or amount_eur > 0);

alter table public.user_packages
  add column if not exists amount_eur integer check (amount_eur is null or amount_eur > 0);
