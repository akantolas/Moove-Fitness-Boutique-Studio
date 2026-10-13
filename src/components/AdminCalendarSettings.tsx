import { useState } from 'react'
import {
  sortTimeStrings,
  WEEKDAY_KEYS,
  type CalendarSettings,
  type WeekdayKey,
} from '../lib/posingDates'
import { useTranslation } from '../i18n/useTranslation'

type AdminCalendarSettingsProps = {
  open: boolean
  onClose: () => void
  settings: CalendarSettings
  busy: boolean
  onSave: (
    payload: Omit<CalendarSettings, 'updated_at'>,
  ) => Promise<CalendarSettings>
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i)
const DURATION_OPTIONS = [30, 40, 45, 60]
const STEP_OPTIONS = [15, 30, 60] as const

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

export function AdminCalendarSettings({
  open,
  onClose,
  settings,
  busy,
  onSave,
}: AdminCalendarSettingsProps) {
  const { t, dictionary } = useTranslation()
  const [draft, setDraft] = useState(() => cloneSettings(settings))
  const [templateDay, setTemplateDay] = useState<WeekdayKey>('1')
  const [error, setError] = useState('')
  const templateTimes = draft.weekday_templates[templateDay].times
  function setTemplateTimes(times: string[]) {
    setDraft((previous) => ({
      ...previous,
      weekday_templates: {
        ...previous.weekday_templates,
        [templateDay]: { ...previous.weekday_templates[templateDay], times },
      },
    }))
  }
  const [newTime, setNewTime] = useState('')
  const [saving, setSaving] = useState(false)

  function addTemplateTime() {
    if (!newTime || templateTimes.includes(newTime)) {
      setNewTime('')
      return
    }
    const hour = Number(newTime.split(':')[0])
    const day = draft.weekday_templates[templateDay]
    if (hour < day.start_hour || hour >= day.end_hour) {
      setError(t('posing.admin.adminErrors.outside_active_hours'))
      return
    }
    setError('')
    setTemplateTimes(sortTimeStrings([...templateTimes, newTime]))
    setNewTime('')
  }

  function removeTemplateTime(time: string) {
    setTemplateTimes(templateTimes.filter((item) => item !== time))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const weekday_templates = Object.fromEntries(
        WEEKDAY_KEYS.map((key) => {
          const day = draft.weekday_templates[key]
          const start_hour = Math.max(draft.grid_start_hour, day.start_hour)
          const end_hour = Math.min(draft.grid_end_hour, day.end_hour)
          if (end_hour <= start_hour)
            throw new Error(
              t('posing.admin.adminErrors.invalid_weekday_templates'),
            )
          return [
            key,
            {
              ...day,
              start_hour,
              end_hour,
              times: day.times.filter((time) => {
                const hour = Number(time.split(':')[0])
                return hour >= start_hour && hour < end_hour
              }),
            },
          ]
        }),
      ) as CalendarSettings['weekday_templates']
      await onSave({
        weekday_templates,
        default_duration_minutes: draft.default_duration_minutes,
        grid_start_hour: draft.grid_start_hour,
        grid_end_hour: draft.grid_end_hour,
        grid_step_minutes: draft.grid_step_minutes,
      })
      onClose()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t('posing.admin.adminErrors.operation_failed'),
      )
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const isDisabled = busy || saving
  const endHourOptions = HOUR_OPTIONS.filter(
    (hour) => hour > draft.grid_start_hour,
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={t('posing.admin.calendarSettings')}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0c10] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
          <h3 className="text-sm font-semibold text-white">
            {t('posing.admin.calendarSettings')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/55 hover:bg-white/5"
            aria-label={t('posing.admin.closeSettings')}
          >
            ×
          </button>
        </div>

        <div className="space-y-5 px-4 py-4 sm:px-5">
          <p className="text-xs text-white/45">
            {t('posing.admin.gridEnvelopeHint')}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-white/55">
              <span className="mb-1.5 block font-semibold uppercase tracking-[0.12em] text-white/45">
                {t('posing.admin.gridEnvelopeStart')}
              </span>
              <select
                value={draft.grid_start_hour}
                disabled={isDisabled}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    grid_start_hour: Number(e.target.value),
                  }))
                }
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
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    grid_end_hour: Number(e.target.value),
                  }))
                }
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
                  setDraft((prev) => ({
                    ...prev,
                    grid_step_minutes: Number(e.target.value),
                  }))
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

          {error ? (
            <p role="alert" className="text-sm text-rose-200">
              {error}
            </p>
          ) : null}
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <label className="mb-3 block text-xs text-white/65">
              {t('posing.admin.weekdayTemplate')}
              <select
                value={templateDay}
                disabled={isDisabled}
                onChange={(event) => {
                  setTemplateDay(event.target.value as WeekdayKey)
                  setNewTime('')
                }}
                className="mt-1.5 block w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
              >
                {WEEKDAY_KEYS.map((key, index) => (
                  <option key={key} value={key}>
                    {dictionary.posing.admin.weekdays[index]}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              {t('posing.admin.dayTemplate')}
            </p>
            <p className="mt-1 text-xs text-white/45">
              {t('posing.admin.dayTemplateHint')}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-xs text-white/60">
                {t('posing.admin.gridEnvelopeStart')}
                <select
                  value={Math.max(
                    draft.grid_start_hour,
                    draft.weekday_templates[templateDay].start_hour,
                  )}
                  disabled={isDisabled}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      weekday_templates: {
                        ...previous.weekday_templates,
                        [templateDay]: {
                          ...previous.weekday_templates[templateDay],
                          start_hour: Number(event.target.value),
                        },
                      },
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
                >
                  {HOUR_OPTIONS.filter(
                    (hour) =>
                      hour >= draft.grid_start_hour &&
                      hour < draft.grid_end_hour,
                  ).map((hour) => (
                    <option key={hour} value={hour}>
                      {formatHourLabel(hour)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-white/60">
                {t('posing.admin.gridEnvelopeEnd')}
                <select
                  value={Math.min(
                    draft.grid_end_hour,
                    draft.weekday_templates[templateDay].end_hour,
                  )}
                  disabled={isDisabled}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      weekday_templates: {
                        ...previous.weekday_templates,
                        [templateDay]: {
                          ...previous.weekday_templates[templateDay],
                          end_hour: Number(event.target.value),
                        },
                      },
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
                >
                  {Array.from({ length: 24 }, (_, index) => index + 1)
                    .filter(
                      (hour) =>
                        hour > draft.grid_start_hour &&
                        hour <= draft.grid_end_hour,
                    )
                    .map((hour) => (
                      <option key={hour} value={hour}>
                        {formatHourLabel(hour)}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {templateTimes.map((time) => (
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
              {templateTimes.length === 0 ? (
                <span className="text-xs text-white/35">
                  {t('posing.admin.noTemplateTimes')}
                </span>
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

          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isDisabled}
              onClick={onClose}
              className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold text-white/70 hover:bg-white/5 disabled:opacity-40"
            >
              {t('posing.admin.cancelSettings')}
            </button>
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => void handleSave()}
              className="rounded-full border border-fuchsia-200/30 bg-fuchsia-500/15 px-5 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20 disabled:opacity-40"
            >
              {saving
                ? t('posing.admin.savingSettings')
                : t('posing.admin.saveSettings')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
