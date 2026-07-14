import { useEffect, useState } from 'react'
import {
  sortTimeStrings,
  WEEKDAY_KEYS,
  type CalendarSettings,
  type WeekdayKey,
  type WeekdayTemplate,
  type WeekdayTemplates,
} from '../lib/posingDates'
import { useTranslation } from '../i18n/useTranslation'

type AdminCalendarSettingsProps = {
  settings: CalendarSettings
  busy: boolean
  onSave: (payload: Omit<CalendarSettings, 'updated_at'>) => Promise<CalendarSettings>
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i)
const DURATION_OPTIONS = [30, 40, 45, 60]
const STEP_OPTIONS = [15, 30, 60] as const

const WEEKDAY_I18N: Record<WeekdayKey, string> = {
  '1': 'posing.admin.weekdayMon',
  '2': 'posing.admin.weekdayTue',
  '3': 'posing.admin.weekdayWed',
  '4': 'posing.admin.weekdayThu',
  '5': 'posing.admin.weekdayFri',
  '6': 'posing.admin.weekdaySat',
  '7': 'posing.admin.weekdaySun',
}

function formatHourLabel(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

function cloneSettings(settings: CalendarSettings): CalendarSettings {
  return {
    ...settings,
    weekday_templates: Object.fromEntries(
      WEEKDAY_KEYS.map((key) => [
        key,
        {
          ...settings.weekday_templates[key],
          times: [...settings.weekday_templates[key].times],
        },
      ]),
    ) as CalendarSettings['weekday_templates'],
  }
}

function normalizeWeekdayTemplates(
  templates: WeekdayTemplates,
  gridStart: number,
  gridEnd: number,
): WeekdayTemplates {
  return Object.fromEntries(
    WEEKDAY_KEYS.map((key) => {
      const wd = templates[key]
      const start_hour = Math.max(gridStart, Math.min(wd.start_hour, wd.end_hour - 1))
      const end_hour = Math.min(gridEnd, Math.max(wd.end_hour, start_hour + 1))
      return [key, { ...wd, start_hour, end_hour }]
    }),
  ) as WeekdayTemplates
}

export function AdminCalendarSettings({ settings, busy, onSave }: AdminCalendarSettingsProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const [activeWeekday, setActiveWeekday] = useState<WeekdayKey>('1')
  const [draft, setDraft] = useState(() => cloneSettings(settings))
  const [newTime, setNewTime] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(cloneSettings(settings))
  }, [settings])

  const weekdayDraft = draft.weekday_templates[activeWeekday]

  function updateWeekday(key: WeekdayKey, patch: Partial<WeekdayTemplate>) {
    setDraft((prev) => ({
      ...prev,
      weekday_templates: {
        ...prev.weekday_templates,
        [key]: { ...prev.weekday_templates[key], ...patch },
      },
    }))
  }

  function addTemplateTime() {
    if (!newTime || weekdayDraft.times.includes(newTime)) {
      setNewTime('')
      return
    }
    updateWeekday(activeWeekday, {
      times: sortTimeStrings([...weekdayDraft.times, newTime]),
    })
    setNewTime('')
  }

  function removeTemplateTime(time: string) {
    updateWeekday(activeWeekday, {
      times: weekdayDraft.times.filter((item) => item !== time),
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const weekday_templates = normalizeWeekdayTemplates(
        draft.weekday_templates,
        draft.grid_start_hour,
        draft.grid_end_hour,
      )
      await onSave({
        weekday_templates,
        default_duration_minutes: draft.default_duration_minutes,
        grid_start_hour: draft.grid_start_hour,
        grid_end_hour: draft.grid_end_hour,
        grid_step_minutes: draft.grid_step_minutes,
      })
    } finally {
      setSaving(false)
    }
  }

  const isDisabled = busy || saving
  const endHourOptions = HOUR_OPTIONS.filter((hour) => hour > draft.grid_start_hour)
  const weekdayEndOptions = HOUR_OPTIONS.filter(
    (hour) => hour > weekdayDraft.start_hour && hour <= draft.grid_end_hour,
  )

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-white">{t('posing.admin.calendarSettings')}</span>
        <span className="text-xs text-white/45">{open ? '−' : '+'}</span>
      </button>

      {open ? (
        <div className="space-y-5 border-t border-white/10 px-4 py-4 sm:px-5">
          <p className="text-xs text-white/45">{t('posing.admin.gridEnvelopeHint')}</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs text-white/55">
              <span className="mb-1.5 block font-semibold uppercase tracking-[0.12em] text-white/45">
                {t('posing.admin.gridEnvelopeStart')}
              </span>
              <select
                value={draft.grid_start_hour}
                disabled={isDisabled}
                onChange={(e) => {
                  const grid_start_hour = Number(e.target.value)
                  setDraft((prev) => ({
                    ...prev,
                    grid_start_hour,
                    weekday_templates: Object.fromEntries(
                      WEEKDAY_KEYS.map((key) => {
                        const wd = prev.weekday_templates[key]
                        const start_hour =
                          wd.start_hour <= prev.grid_start_hour
                            ? grid_start_hour
                            : Math.max(grid_start_hour, wd.start_hour)
                        return [
                          key,
                          {
                            ...wd,
                            start_hour,
                            end_hour: Math.min(
                              Math.max(wd.end_hour, grid_start_hour + 1),
                              prev.grid_end_hour,
                            ),
                          },
                        ]
                      }),
                    ) as CalendarSettings['weekday_templates'],
                  }))
                }}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
              >
                {HOUR_OPTIONS.map((hour) => (
                  <option key={hour} value={hour}>
                    {formatHourLabel(hour)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-white/55">
              <span className="mb-1.5 block font-semibold uppercase tracking-[0.12em] text-white/45">
                {t('posing.admin.gridEnvelopeEnd')}
              </span>
              <select
                value={draft.grid_end_hour}
                disabled={isDisabled}
                onChange={(e) => {
                  const grid_end_hour = Number(e.target.value)
                  setDraft((prev) => ({
                    ...prev,
                    grid_end_hour,
                    weekday_templates: Object.fromEntries(
                      WEEKDAY_KEYS.map((key) => {
                        const wd = prev.weekday_templates[key]
                        return [
                          key,
                          {
                            ...wd,
                            end_hour: Math.min(wd.end_hour, grid_end_hour),
                            start_hour: Math.min(wd.start_hour, grid_end_hour - 1),
                          },
                        ]
                      }),
                    ) as CalendarSettings['weekday_templates'],
                  }))
                }}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
              >
                {endHourOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {formatHourLabel(hour)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-white/55">
              <span className="mb-1.5 block font-semibold uppercase tracking-[0.12em] text-white/45">
                {t('posing.admin.gridStep')}
              </span>
              <select
                value={draft.grid_step_minutes}
                disabled={isDisabled}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, grid_step_minutes: Number(e.target.value) }))
                }
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
              >
                {STEP_OPTIONS.map((step) => (
                  <option key={step} value={step}>
                    {step} min
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-white/55">
              <span className="mb-1.5 block font-semibold uppercase tracking-[0.12em] text-white/45">
                {t('posing.admin.defaultDuration')}
              </span>
              <select
                value={draft.default_duration_minutes}
                disabled={isDisabled}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    default_duration_minutes: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
              >
                {DURATION_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} min
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              {t('posing.admin.weekdayActiveHours')}
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {WEEKDAY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveWeekday(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    activeWeekday === key
                      ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black'
                      : 'border border-white/10 text-white/70 hover:bg-white/5'
                  }`}
                >
                  {t(WEEKDAY_I18N[key])}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-medium text-white">{t(WEEKDAY_I18N[activeWeekday])}</p>
            <p className="mt-1 text-xs text-fuchsia-100/70">
              {t('posing.admin.activeHoursSummary', {
                weekday: t(WEEKDAY_I18N[activeWeekday]),
                from: formatHourLabel(weekdayDraft.start_hour),
                until: formatHourLabel(weekdayDraft.end_hour),
              })}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs text-white/55">
                <span className="mb-1.5 block font-semibold uppercase tracking-[0.12em] text-white/45">
                  {t('posing.admin.weekdayActiveFrom')}
                </span>
                <select
                  value={weekdayDraft.start_hour}
                  disabled={isDisabled}
                  onChange={(e) =>
                    updateWeekday(activeWeekday, { start_hour: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
                >
                  {HOUR_OPTIONS.filter(
                    (hour) => hour >= draft.grid_start_hour && hour < weekdayDraft.end_hour,
                  ).map((hour) => (
                    <option key={hour} value={hour}>
                      {formatHourLabel(hour)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs text-white/55">
                <span className="mb-1.5 block font-semibold uppercase tracking-[0.12em] text-white/45">
                  {t('posing.admin.weekdayActiveUntil')}
                </span>
                <select
                  value={weekdayDraft.end_hour}
                  disabled={isDisabled}
                  onChange={(e) =>
                    updateWeekday(activeWeekday, { end_hour: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
                >
                  {weekdayEndOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {formatHourLabel(hour)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                {t('posing.admin.dayTemplate')}
              </p>
              <p className="mt-1 text-xs text-white/45">{t('posing.admin.dayTemplateHint')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {weekdayDraft.times.map((time) => (
                  <span
                    key={time}
                    className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-xs text-white/80"
                  >
                    {time}
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => removeTemplateTime(time)}
                      className="rounded-full px-1 text-white/45 hover:text-rose-200 disabled:opacity-40"
                      aria-label={`${t('posing.admin.removeTime')} ${time}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {weekdayDraft.times.length === 0 ? (
                  <span className="text-xs text-white/35">{t('posing.admin.noTemplateTimes')}</span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="time"
                  value={newTime}
                  disabled={isDisabled}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
                  aria-label={t('posing.admin.addTime')}
                />
                <button
                  type="button"
                  disabled={isDisabled || !newTime}
                  onClick={addTemplateTime}
                  className="rounded-lg border border-emerald-300/25 px-3 py-1.5 text-xs font-medium text-emerald-200/90 hover:bg-emerald-400/10 disabled:opacity-40"
                >
                  {t('posing.admin.addTime')}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => void handleSave()}
              className="rounded-full border border-fuchsia-200/30 bg-fuchsia-500/15 px-5 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20 disabled:opacity-40"
            >
              {saving ? t('posing.admin.savingSettings') : t('posing.admin.saveSettings')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
