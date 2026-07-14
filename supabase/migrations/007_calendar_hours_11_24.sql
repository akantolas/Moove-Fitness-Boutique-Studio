-- Default admin calendar grid: 11:00 – 24:00 (last slot 23:30 with 30-min step)

alter table public.posing_calendar_settings
  alter column grid_start_hour set default 11;

alter table public.posing_calendar_settings
  alter column grid_end_hour set default 24;

with new_templates as (
  select jsonb_object_agg(
    wd::text,
    jsonb_build_object(
      'times', to_jsonb(
        array[
          '11:00', '12:00', '14:00', '15:00', '16:00', '17:00',
          '18:00', '19:00', '20:00', '21:00', '22:00'
        ]::text[]
      ),
      'start_hour', 11,
      'end_hour', 24
    )
  ) as templates
  from generate_series(1, 7) as wd
)
update public.posing_calendar_settings
set
  grid_start_hour = 11,
  grid_end_hour = 24,
  weekday_templates = new_templates.templates,
  updated_at = now()
from new_templates
where posing_calendar_settings.id = 1;
