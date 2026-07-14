import { useEffect, useState } from 'react'
import type { CalendarSettings } from '../lib/posingDates'
import { sortTimeStrings } from '../lib/posingDates'
import { useTranslation } from '../i18n/useTranslation'

type AdminCalendarSettingsProps = {
  settings: CalendarSettings
  busy: boolean
  onSave: (payload: Omit<CalendarSettings, 'updated_at'>) => Promise<CalendarSettings>
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i)
const DURATION_OPTIONS = [30, 40, 45, 60]
const STEP_OPTIONS = [15, 30, 60] as const

export function AdminCalendarSettings({ settings, busy, onSave }: AdminCalendarSettingsProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(true)
  const [draft, setDraft] = useState(settings)
  const [newTime, setNewTime] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  function addTemplateTime() {
    if (!newTime) return
    if (draft.day_template_times.includes(newTime)) {
      setNewTime('')
      return
    }
    setDraft((prev) => ({
      ...prev,
      day_template_times: sortTimeStrings([...prev.day_template_times, newTime]),
    }))
    setNewTime('')
  }

  function removeTemplateTime(time: string) {
    setDraft((prev) => ({
      ...prev,
      day_template_times: prev.day_template_times.filter((item) => item !== time),
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({
        day_template_times: draft.day_template_times,
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              {t('posing.admin.dayTemplate')}
            </p>
            <p className="mt-1 text-xs text-white/45">{t('posing.admin.dayTemplateHint')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {draft.day_template_times.map((time) => (
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
              {draft.day_template_times.length === 0 ? (
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-xs text-white/55">
              <span className="mb-1.5 block font-semibold uppercase tracking-[0.12em] text-white/45">
                {t('posing.admin.gridStart')}
              </span>
              <select
                value={draft.grid_start_hour}
                disabled={isDisabled}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, grid_start_hour: Number(e.target.value) }))
                }
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
              >
                {HOUR_OPTIONS.map((hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-white/55">
              <span className="mb-1.5 block font-semibold uppercase tracking-[0.12em] text-white/45">
                {t('posing.admin.gridEnd')}
              </span>
              <select
                value={draft.grid_end_hour}
                disabled={isDisabled}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, grid_end_hour: Number(e.target.value) }))
                }
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
              >
                {HOUR_OPTIONS.filter((hour) => hour > draft.grid_start_hour).map((hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, '0')}:00
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
