-- Persist UI locale on bookings for post-payment emails

alter table public.posing_bookings
  add column if not exists locale text not null default 'el'
  check (locale in ('el', 'en'));
