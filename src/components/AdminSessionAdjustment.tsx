import { useState } from 'react'
import type { AdminMemberPackage } from '../lib/posingApi'
import { useTranslation } from '../i18n/useTranslation'
import { ConfirmDialog } from './ConfirmDialog'
import { useCurrentTime } from '../hooks/useCurrentTime'

export function AdminSessionAdjustment({
  pkg,
  busy,
  onAdjust,
}: {
  pkg: AdminMemberPackage
  busy: boolean
  onAdjust: (
    packageId: string,
    delta: number,
    reason: string,
    requestId: string,
  ) => Promise<void>
}) {
  const { t, locale } = useTranslation()
  const now = useCurrentTime()
  const [action, setAction] = useState<{
    delta: number
    requestId: string
    before: number
  } | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const active =
    pkg.status === 'active' &&
    Boolean(pkg.period_end && Date.parse(pkg.period_end) > now)
  const remaining = Math.max(0, pkg.sessions_total - pkg.sessions_used)
  async function save() {
    if (!action) return
    setSaving(true)
    setError('')
    try {
      await onAdjust(pkg.id, action.delta, reason.trim(), action.requestId)
      setAction(null)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('posing.admin.adminErrors.operation_failed'),
      )
    } finally {
      setSaving(false)
    }
  }
  function open(delta: number) {
    setReason('')
    setError('')
    setAction({
      delta,
      requestId: crypto.randomUUID(),
      before: pkg.sessions_total,
    })
  }
  return (
    <>
      {active ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => open(1)}
            className="rounded-full border border-emerald-300/25 px-3 py-1.5 text-xs text-emerald-200 disabled:opacity-40"
          >
            {t('posing.admin.addSession')}
          </button>
          <button
            type="button"
            disabled={busy || remaining === 0}
            onClick={() => open(-1)}
            className="rounded-full border border-rose-300/25 px-3 py-1.5 text-xs text-rose-200 disabled:opacity-40"
          >
            {t('posing.admin.removeSession')}
          </button>
        </div>
      ) : null}
      {(pkg.adjustments ?? []).length ? (
        <details className="mt-3 text-xs text-white/55">
          <summary className="cursor-pointer">
            {t('posing.admin.adjustmentHistory')}
          </summary>
          <ul className="mt-2 space-y-2">
            {pkg.adjustments?.map((entry) => (
              <li key={entry.id}>
                <span className="text-white/80">
                  {entry.delta > 0 ? '+' : ''}
                  {entry.delta} · {entry.reason}
                </span>
                <span className="block">
                  {new Intl.DateTimeFormat(
                    locale === 'el' ? 'el-GR' : 'en-GB',
                    {
                      dateStyle: 'short',
                      timeStyle: 'short',
                      timeZone: 'Europe/Athens',
                    },
                  ).format(new Date(entry.created_at))}{' '}
                  · {entry.actor_name ?? '—'} · {entry.total_before} →{' '}
                  {entry.total_after}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      <ConfirmDialog
        open={action !== null}
        title={t(
          action?.delta === 1
            ? 'posing.admin.addSession'
            : 'posing.admin.removeSession',
        )}
        body={t('posing.admin.adjustmentExplanation', {
          before: action?.before ?? pkg.sessions_total,
          after: (action?.before ?? pkg.sessions_total) + (action?.delta ?? 0),
        })}
        confirmLabel={t('posing.admin.saveAdjustment')}
        cancelLabel={t('posing.admin.cancelDeleteMember')}
        busy={busy || saving}
        destructive={action?.delta === -1}
        confirmDisabled={reason.trim().length < 3}
        onConfirm={() => void save()}
        onCancel={() => setAction(null)}
      >
        <label className="mt-4 block text-sm text-white/75">
          {t('posing.admin.adjustmentReason')}
          <textarea
            value={reason}
            maxLength={500}
            rows={3}
            onChange={(e) => setReason(e.target.value)}
            disabled={busy || saving}
            className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-white outline-none focus:border-fuchsia-300/60"
          />
        </label>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
      </ConfirmDialog>
    </>
  )
}
