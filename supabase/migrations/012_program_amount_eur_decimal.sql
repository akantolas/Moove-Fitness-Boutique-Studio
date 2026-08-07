-- Bundle prices use .90 decimals (34.90, 99.90). Store as numeric, not integer.

alter table public.moove_program_purchases
  alter column amount_eur type numeric(10, 2) using amount_eur::numeric(10, 2);

alter table public.nutrition_plan_orders
  alter column amount_eur type numeric(10, 2) using amount_eur::numeric(10, 2);
