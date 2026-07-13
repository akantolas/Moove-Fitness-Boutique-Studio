-- Payment audit fields for manual admin confirmation
alter table public.user_packages
  add column if not exists payment_method text
    check (payment_method in ('stripe', 'manual')),
  add column if not exists confirmed_by uuid references public.profiles (id);
