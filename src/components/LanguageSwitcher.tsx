import { useIsPosingRoute } from '../hooks/useIsPosingRoute'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const posing = useIsPosingRoute()
  const { locale, setLocale, t } = useTranslation()

  function pillClass(active: boolean) {
    if (posing) {
      return `rounded-full px-2.5 py-1 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
        active
          ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-300 text-black'
          : 'text-white/60 hover:text-white'
      }`
    }
    return `rounded-full px-2.5 py-1 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
      active ? 'bg-moove-lime/90 text-moove-ink' : 'text-moove-muted hover:text-moove-silver'
    }`
  }

  const shellClass = posing
    ? 'inline-flex items-center gap-0.5 rounded-full border border-white/15 bg-white/[0.04] p-0.5'
    : 'inline-flex items-center gap-0.5 rounded-full border border-moove-border/80 bg-moove-elevated/50 p-0.5'

  return (
    <div
      className={shellClass}
      role="group"
      aria-label={t('lang.switch')}
    >
      {(['el', 'en'] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          className={pillClass(locale === code)}
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
        >
          {compact ? code.toUpperCase() : t(`lang.${code}`)}
        </button>
      ))}
    </div>
  )
}
