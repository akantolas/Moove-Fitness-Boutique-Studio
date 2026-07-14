-- Admin calendar settings (singleton row)

create table if not exists public.posing_calendar_settings (
  id smallint primary key default 1 check (id = 1),
  day_template_times text[] not null,
  default_duration_minutes integer not null default 30
    check (default_duration_minutes >= 15 and default_duration_minutes <= 120),
  grid_start_hour integer not null default 9
    check (grid_start_hour >= 0 and grid_start_hour <= 23),
  grid_end_hour integer not null default 21
    check (grid_end_hour >= 1 and grid_end_hour <= 24),
  grid_step_minutes integer not null default 30
    check (grid_step_minutes in (15, 30, 60)),
  updated_at timestamptz not null default now(),
  check (grid_end_hour > grid_start_hour)
);

insert into public.posing_calendar_settings (
  id,
  day_template_times,
  default_duration_minutes,
  grid_start_hour,
  grid_end_hour,
  grid_step_minutes
)
values (
  1,
  array['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
  30,
  9,
  21,
  30
)
on conflict (id) do nothing;

alter table public.posing_calendar_settings enable row level security;

create policy calendar_settings_admin on public.posing_calendar_settings
  for all using (public.is_admin()) with check (public.is_admin());
