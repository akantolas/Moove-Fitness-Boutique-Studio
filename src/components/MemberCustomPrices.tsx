import { useState } from 'react'
import { ALL_PLAN_KEYS, CATALOG_PRICES_EUR } from '../lib/posingCatalogPrices'
import type { AdminMemberPlanPrice } from '../lib/posingApi'
import { planKeyLabel } from '../lib/posingLabels'
import { useTranslation } from '../i18n/useTranslation'
import type { PosingPlanKey } from '../site'

type MemberCustomPricesProps = {
  memberId: string
  planPrices: AdminMemberPlanPrice[]
  busy: boolean
  onSave: (planKey: PosingPlanKey, priceEur: number) => Promise<void>
  onRemove: (planKey: PosingPlanKey) => Promise<void>
}

export function MemberCustomPrices({
  memberId,
  planPrices,
  busy,
  onSave,
  onRemove,
}: MemberCustomPricesProps) {
  const { t, dictionary } = useTranslation()
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [error, setError] = useState('')

  const overrideMap = new Map(planPrices.map((p) => [p.plan_key, p]))

  async function handleSave(planKey: PosingPlanKey) {
    const raw = drafts[planKey] ?? ''
    const price = Math.round(Number(raw))
    if (!price || price <= 0) {
      setError(t('posing.admin.customPriceInvalid'))
      return
    }
    setError('')
    setSavingKey(planKey)
    try {
      await onSave(planKey, price)
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[planKey]
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('posing.admin.customPriceSaveFailed'))
    } finally {
      setSavingKey(null)
    }
  }

  async function handleRemove(planKey: PosingPlanKey) {
    setError('')
    setSavingKey(planKey)
    try {
      await onRemove(planKey)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('posing.admin.customPriceSaveFailed'))
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4 sm:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
        {t('posing.admin.customPricesTitle')}
      </p>
      <p className="mt-1 text-xs text-white/45">{t('posing.admin.customPricesBody')}</p>

      {error ? (
        <p className="mt-3 rounded-lg border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-100">
          {error}
        </p>
      ) : null}

      <ul className="mt-3 space-y-2">
        {ALL_PLAN_KEYS.map((planKey) => {
          const override = overrideMap.get(planKey)
          const catalog = CATALOG_PRICES_EUR[planKey]
          const label = planKeyLabel(planKey, (i) => dictionary.posing.pricing.packages[i]?.name)
          const draft = drafts[planKey] ?? (override ? String(override.price_eur) : '')

          return (
            <li
              key={`${memberId}-${planKey}`}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="mt-0.5 text-xs text-white/45">
                  {t('posing.admin.catalogPrice', { price: `${catalog}€` })}
                  {override ? (
                    <span className="ml-2 text-fuchsia-200/80">
                      · {t('posing.admin.customPriceActive', { price: `${override.price_eur}€` })}
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={draft}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [planKey]: e.target.value }))
                  }
                  placeholder={`${catalog}`}
                  className="w-24 rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-sm text-white outline-none focus:border-fuchsia-300/40"
                  aria-label={`${label} €`}
                />
                <button
                  type="button"
                  disabled={busy || savingKey === planKey}
                  onClick={() => void handleSave(planKey)}
                  className="rounded-full border border-fuchsia-300/35 px-3 py-1 text-xs text-fuchsia-100 hover:bg-fuchsia-400/10 disabled:opacity-50"
                >
                  {savingKey === planKey ? '…' : t('posing.admin.savePrice')}
                </button>
                {override ? (
                  <button
                    type="button"
                    disabled={busy || savingKey === planKey}
                    onClick={() => void handleRemove(planKey)}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/55 hover:bg-white/5 disabled:opacity-50"
                  >
                    {t('posing.admin.removeOverride')}
                  </button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
