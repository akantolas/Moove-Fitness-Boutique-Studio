-- July 2026 promotional packages: Ruby x8 and Diamond x8

insert into public.package_plans (key, name_en, name_el, sessions_total, period_days, duration_minutes, sort_order)
values
  ('ruby_july8', 'Ruby x8 — July Offer', 'Ruby x8 — Προσφορά Ιουλίου', 8, 60, 30, 5),
  ('diamond_july8', 'Diamond x8 — July Offer', 'Diamond x8 — Προσφορά Ιουλίου', 8, 60, 40, 6)
on conflict (key) do update set
  name_en = excluded.name_en,
  name_el = excluded.name_el,
  sessions_total = excluded.sessions_total,
  period_days = excluded.period_days,
  duration_minutes = excluded.duration_minutes,
  sort_order = excluded.sort_order;
