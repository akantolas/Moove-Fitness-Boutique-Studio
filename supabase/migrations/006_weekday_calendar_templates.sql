-- Per-weekday calendar templates (replaces global day_template_times)

alter table public.posing_calendar_settings
  add column if not exists weekday_templates jsonb not null default '{}';

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
  and weekday_templates = '{}'::jsonb
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'posing_calendar_settings'
      and column_name = 'day_template_times'
  );

alter table public.posing_calendar_settings
  drop column if exists day_template_times;
