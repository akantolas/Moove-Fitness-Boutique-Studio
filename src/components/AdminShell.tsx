import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../i18n/useTranslation'

type AdminTabConfig = {
  id: string
  label: string
  badge?: number
}

type AdminShellProps = {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
  tabs: AdminTabConfig[]
  activeTab: string
  onTabChange: (tabId: string) => void
  onRefresh?: () => void
  refreshDisabled?: boolean
  children: ReactNode
}

export function AdminShell({
  title,
  subtitle,
  eyebrow,
  actions,
  tabs,
  activeTab,
  onTabChange,
  onRefresh,
  refreshDisabled = false,
  children,
}: AdminShellProps) {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 80% at 10% 0%, rgba(192, 38, 211, 0.2) 0%, transparent 55%), radial-gradient(circle at 90% 20%, rgba(34, 211, 238, 0.12) 0%, transparent 45%)',
          }}
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              to="/posing"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45 transition hover:text-white/75"
            >
              {t('posing.admin.backToPosing')}
            </Link>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
              {eyebrow ?? t('posing.admin.eyebrow')}
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <nav
          className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-1"
          aria-label="Admin sections"
        >
          {tabs.map((tab) => {
            const active = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 sm:text-sm ${
                  active
                    ? 'border-fuchsia-100/20 bg-white/[0.06] text-white shadow-[0_10px_30px_-24px_rgba(244,114,182,0.85)]'
                    : 'border-transparent text-white/55 hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                {tab.label}
                {tab.badge && tab.badge > 0 ? (
                  <span className="rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[10px] font-bold text-black">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>
        {onRefresh ? (
          <button
            type="button"
            disabled={refreshDisabled}
            onClick={onRefresh}
            className="shrink-0 rounded-full border border-white/14 bg-white/[0.035] px-4 py-2.5 text-xs font-semibold text-white/75 transition hover:border-fuchsia-100/28 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
          >
            {t('posing.admin.refresh')}
          </button>
        ) : null}
      </div>

      <div className="mt-8">{children}</div>
    </div>
  )
}

type AdminStatCardProps = {
  label: string
  value: number | string
  accent?: 'fuchsia' | 'cyan' | 'amber' | 'emerald'
  onClick?: () => void
}

const accentClasses = {
  fuchsia: 'border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-100',
  cyan: 'border-cyan-300/25 bg-cyan-500/10 text-cyan-100',
  amber: 'border-amber-300/25 bg-amber-500/10 text-amber-100',
  emerald: 'border-emerald-300/25 bg-emerald-500/10 text-emerald-100',
}

export function AdminStatCard({ label, value, accent = 'fuchsia', onClick }: AdminStatCardProps) {
  const className = `rounded-2xl border p-5 text-left transition ${accentClasses[accent]} ${
    onClick ? 'cursor-pointer hover:brightness-110' : ''
  }`

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{label}</p>
        <p className="font-display mt-2 text-3xl font-semibold">{value}</p>
      </button>
    )
  }

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="font-display mt-2 text-3xl font-semibold">{value}</p>
    </div>
  )
}

export function AdminPanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 rounded-2xl border border-white/10 bg-white/[0.03]" />
      ))}
    </div>
  )
}

export function AdminStatsSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-24 rounded-2xl border border-white/10 bg-white/[0.03]" />
      ))}
    </div>
  )
}
