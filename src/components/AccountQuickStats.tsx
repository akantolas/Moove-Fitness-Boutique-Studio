import { useTranslation } from '../i18n/useTranslation'

type AccountQuickStatsProps = {
  activePackages: number
  upcomingBookings: number
  division: string
}

export function AccountQuickStats({
  activePackages,
  upcomingBookings,
  division,
}: AccountQuickStatsProps) {
  const { t } = useTranslation()

  const items = [
    {
      label: t('posing.account.quickStatsPackages'),
      value: String(activePackages),
    },
    {
      label: t('posing.account.quickStatsBookings'),
      value: String(upcomingBookings),
    },
    {
      label: t('posing.account.division'),
      value: division.trim() || '—',
    },
  ]

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-center sm:text-left"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
            {item.label}
          </p>
          <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
