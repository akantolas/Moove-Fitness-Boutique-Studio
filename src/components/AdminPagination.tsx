import { useTranslation } from '../i18n/useTranslation'

export function AdminPagination({
  page,
  total,
  pageSize = 20,
  busy = false,
  onChange,
}: {
  page: number
  total: number
  pageSize?: number
  busy?: boolean
  onChange: (page: number) => void
}) {
  const { t } = useTranslation()
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-white/65">
      <p>{t('posing.admin.pageSummary', { page, pages, total })}</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy || page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-full border border-white/15 px-4 py-2 disabled:opacity-35"
        >
          {t('posing.admin.previousPage')}
        </button>
        <button
          type="button"
          disabled={busy || page >= pages}
          onClick={() => onChange(page + 1)}
          className="rounded-full border border-white/15 px-4 py-2 disabled:opacity-35"
        >
          {t('posing.admin.nextPage')}
        </button>
      </div>
    </div>
  )
}
