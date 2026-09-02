-- Allow VAT-inclusive program prices with cents while preserving existing purchases.

alter table public.moove_program_purchases
  alter column amount_eur type numeric(10, 2)
  using amount_eur::numeric(10, 2);
