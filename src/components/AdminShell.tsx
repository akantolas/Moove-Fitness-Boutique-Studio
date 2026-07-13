import type { ReactNode } from 'react'

type AdminShellProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
  tabs: Array<{ id: string; label: string }>
  activeTab: string
  onTabChange: (tabId: string) => void
  children: ReactNode
}

export function AdminShell({
  title,
  subtitle,
  actions,
  tabs,
  activeTab,
  onTabChange,
  children,
}: AdminShellProps) {
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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">Admin</p>
            <h1 className="font-display mt-2 text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>

      <nav
        className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-black/20 p-1"
        aria-label="Admin sections"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition sm:text-sm ${
                active
                  ? 'bg-gradient-to-r from-fuchsia-500/90 to-cyan-400/90 text-black shadow-lg'
                  : 'text-white/55 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  )
}

type AdminStatCardProps = {
  label: string
  value: number | string
  accent?: 'fuchsia' | 'cyan' | 'amber' | 'emerald'
}

const accentClasses = {
  fuchsia: 'border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-100',
  cyan: 'border-cyan-300/25 bg-cyan-500/10 text-cyan-100',
  amber: 'border-amber-300/25 bg-amber-500/10 text-amber-100',
  emerald: 'border-emerald-300/25 bg-emerald-500/10 text-emerald-100',
}

export function AdminStatCard({ label, value, accent = 'fuchsia' }: AdminStatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${accentClasses[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="font-display mt-2 text-3xl font-semibold">{value}</p>
    </div>
  )
}
