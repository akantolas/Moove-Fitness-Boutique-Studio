import { studioStatus } from '../lib/openingHours'
import { useTranslation } from '../i18n/useTranslation'
import { useCurrentTime } from './useCurrentTime'

/** Whether the studio is open right now, with the sentence that says so in the visitor's language. */
export function useStudioStatus() {
  const { t, dictionary } = useTranslation()
  const now = useCurrentTime()
  const status = studioStatus(now)
  const reach = dictionary.contact.reach

  const text = !status
    ? ''
    : status.open
      ? t('contact.reach.openNow', { time: status.closes })
      : t('contact.reach.closedNow', {
          when:
            status.daysAhead === 0
              ? reach.today
              : status.daysAhead === 1
                ? reach.tomorrow
                : dictionary.schedule.days[status.dayKey].label,
          time: status.opens,
        })

  return { open: status?.open ?? false, text }
}
