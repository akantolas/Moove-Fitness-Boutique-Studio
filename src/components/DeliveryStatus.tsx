import { useTranslation } from '../i18n/useTranslation'

export function DeliveryStatus({ status }: { status?: string }) {
  const { t } = useTranslation()
  const key =
    status === 'sent'
      ? 'deliverySent'
      : status === 'failed'
        ? 'deliveryFailed'
        : status === 'pending'
          ? 'deliveryPending'
          : 'deliveryUnknown'
  return (
    <p
      className={`mt-2 text-xs ${status === 'sent' ? 'text-emerald-200' : status === 'failed' ? 'text-rose-200' : 'text-amber-100/80'}`}
    >
      {t(`posing.admin.${key}`)}
    </p>
  )
}
