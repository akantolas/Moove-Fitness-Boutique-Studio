-- Idempotent setup for posing admin calendar settings (005 + 006 combined).
-- Run once in Supabase Dashboard → SQL Editor. Safe to re-run.

create table if not exists public.posing_calendar_settings (
  id smallint primary key default 1 check (id = 1),
  weekday_templates jsonb not null default '{}',
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

alter table public.posing_calendar_settings
  add column if not exists weekday_templates jsonb not null default '{}';

alter table public.posing_calendar_settings
  add column if not exists default_duration_minutes integer not null default 30;

alter table public.posing_calendar_settings
  add column if not exists grid_start_hour integer not null default 9;

alter table public.posing_calendar_settings
  add column if not exists grid_end_hour integer not null default 21;

alter table public.posing_calendar_settings
  add column if not exists grid_step_minutes integer not null default 30;

alter table public.posing_calendar_settings
  add column if not exists updated_at timestamptz not null default now();

do $upgrade$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posing_calendar_settings'
      and column_name = 'day_template_times'
  ) then
    update public.posing_calendar_settings
    set weekday_templates = (
      select coalesce(
        jsonb_object_agg(
          wd::text,
          jsonb_build_object(
            'times', day_template_times,
            'start_hour', grid_start_hour,
            'end_hour', grid_end_hour
          )
        ),
        '{}'::jsonb
      )
      from generate_series(1, 7) as wd
    )
    where id = 1
      and weekday_templates = '{}'::jsonb;

    alter table public.posing_calendar_settings
      drop column day_template_times;
  end if;
end
$upgrade$;

with default_templates as (
  select jsonb_object_agg(
    wd::text,
    jsonb_build_object(
      'times', to_jsonb(
        array['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']::text[]
      ),
      'start_hour', 9,
      'end_hour', 21
    )
  ) as templates
  from generate_series(1, 7) as wd
)
insert into public.posing_calendar_settings (
  id,
  weekday_templates,
  default_duration_minutes,
  grid_start_hour,
  grid_end_hour,
  grid_step_minutes
)
select
  1,
  templates,
  30,
  9,
  21,
  30
from default_templates
on conflict (id) do nothing;

with default_templates as (
  select jsonb_object_agg(
    wd::text,
    jsonb_build_object(
      'times', to_jsonb(
        array['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']::text[]
      ),
      'start_hour', 9,
      'end_hour', 21
    )
  ) as templates
  from generate_series(1, 7) as wd
)
update public.posing_calendar_settings
set weekday_templates = default_templates.templates
from default_templates
where posing_calendar_settings.id = 1
  and posing_calendar_settings.weekday_templates = '{}'::jsonb;

alter table public.posing_calendar_settings enable row level security;

do $policy$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'posing_calendar_settings'
      and policyname = 'calendar_settings_admin'
  ) then
    create policy calendar_settings_admin on public.posing_calendar_settings
      for all using (public.is_admin()) with check (public.is_admin());
  end if;
end
$policy$;
