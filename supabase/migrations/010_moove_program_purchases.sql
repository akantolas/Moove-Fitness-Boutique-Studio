-- Moove studio — ready-made program purchases (guest, no auth)

create table if not exists public.moove_program_purchases (
  id uuid primary key default gen_random_uuid(),
  program_key text not null,
  email text not null,
  amount_eur integer not null check (amount_eur > 0),
  locale text not null default 'el' check (locale in ('el', 'en')),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'cancelled')),
  payment_method text check (payment_method in ('stripe', 'manual')),
  stripe_session_id text,
  access_token text,
  payment_email_sent_at timestamptz,
  access_email_sent_at timestamptz,
  confirmed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists moove_program_purchases_access_token_idx
  on public.moove_program_purchases (access_token)
  where access_token is not null;

create unique index if not exists moove_program_purchases_stripe_session_idx
  on public.moove_program_purchases (stripe_session_id)
  where stripe_session_id is not null;

create index if not exists moove_program_purchases_status_idx
  on public.moove_program_purchases (status);

create index if not exists moove_program_purchases_email_created_idx
  on public.moove_program_purchases (email, created_at desc);

alter table public.moove_program_purchases enable row level security;
