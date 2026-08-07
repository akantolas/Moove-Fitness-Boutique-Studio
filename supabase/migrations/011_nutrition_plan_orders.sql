-- Personalized nutrition plan orders (guest checkout)

create table if not exists public.nutrition_plan_orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'el' check (locale in ('el', 'en')),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'cancelled', 'generation_failed')),
  amount_eur integer not null check (amount_eur > 0),
  purchase_type text not null check (purchase_type in ('standalone', 'program_addon')),
  program_purchase_id uuid references public.moove_program_purchases (id) on delete set null,
  program_key text,
  responses jsonb not null,
  calculated jsonb,
  meal_plan jsonb,
  pdf_storage_path text,
  stripe_session_id text,
  plan_email_sent_at timestamptz,
  payment_method text check (payment_method in ('stripe', 'manual')),
  payment_email_sent_at timestamptz,
  confirmed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nutrition_plan_orders_email_idx
  on public.nutrition_plan_orders (email);

create index if not exists nutrition_plan_orders_status_idx
  on public.nutrition_plan_orders (status);

create index if not exists nutrition_plan_orders_program_purchase_idx
  on public.nutrition_plan_orders (program_purchase_id)
  where program_purchase_id is not null;

create unique index if not exists nutrition_plan_orders_stripe_session_idx
  on public.nutrition_plan_orders (stripe_session_id)
  where stripe_session_id is not null;

alter table public.nutrition_plan_orders enable row level security;

-- Supabase Storage bucket for generated PDFs (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'nutrition-pdfs',
  'nutrition-pdfs',
  false,
  5242880,
  array['application/pdf']::text[]
)
on conflict (id) do nothing;
