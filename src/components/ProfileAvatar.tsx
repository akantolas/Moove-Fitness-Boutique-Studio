import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { getProfileInitials } from '../lib/posingAccount'
import { useTranslation } from '../i18n/useTranslation'

const sizeClasses = {
  sm: 'h-9 w-9 text-xs ring-2',
  lg: 'h-24 w-24 text-xl ring-2 sm:h-28 sm:w-28 sm:text-2xl ring-[3px]',
} as const

type ProfileAvatarProps = {
  fullName: string | null
  email: string
  avatarUrl: string | null
  size?: keyof typeof sizeClasses
  editable?: boolean
  busy?: boolean
  onUpload?: (file: File) => Promise<void>
  onRemove?: () => Promise<void>
}

function CameraIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function ProfileAvatar({
  fullName,
  email,
  avatarUrl,
  size = 'lg',
  editable = false,
  busy = false,
  onUpload,
  onRemove,
}: ProfileAvatarProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [localError, setLocalError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const initials = getProfileInitials(fullName, email)

  const closePreview = useCallback(() => setPreviewOpen(false), [])

  useEffect(() => {
    if (!previewOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    previewRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closePreview()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [previewOpen, closePreview])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !onUpload) return
    setLocalError('')
    try {
      await onUpload(file)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'avatar_upload_failed'
      const key = `posing.account.errors.${code}`
      const translated = t(key)
      setLocalError(translated === key ? code : translated)
    }
  }

  async function handleRemove() {
    if (!onRemove) return
    setLocalError('')
    try {
      await onRemove()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'avatar_upload_failed')
    }
  }

  const bubbleClass = `relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500/80 to-cyan-400/80 font-semibold text-black ring-fuchsia-300/40 ${sizeClasses[size]} ${busy ? 'opacity-60' : ''}`

  return (
    <div className={editable ? 'flex flex-col items-center gap-3' : 'shrink-0'}>
      <div className="relative">
        {avatarUrl && !busy ? (
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className={`${bubbleClass} cursor-zoom-in transition hover:ring-fuchsia-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/70`}
            aria-label={t('posing.account.avatarPreview')}
          >
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          </button>
        ) : (
          <div className={bubbleClass}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
            {busy ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-[10px] text-white">{t('posing.account.avatarUploading')}</span>
              </div>
            ) : null}
          </div>
        )}
        {editable && !busy ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 -right-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white/80 transition hover:bg-fuchsia-500/30 hover:text-white"
            aria-label={t('posing.account.avatarChange')}
          >
            <CameraIcon />
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void handleFileChange(e)}
        />
      </div>
      {editable && avatarUrl ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleRemove()}
          className="text-xs text-white/50 transition hover:text-rose-200 disabled:opacity-50"
        >
          {t('posing.account.avatarRemove')}
        </button>
      ) : null}
      {localError ? <p className="max-w-[12rem] text-center text-xs text-rose-200">{localError}</p> : null}

      {previewOpen && avatarUrl ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t('posing.account.avatarPreview')}
        >
          <button
            type="button"
            className="animate-pose-overlay-fade absolute inset-0 bg-[#050508]/85 backdrop-blur-xl"
            aria-label={t('posing.account.avatarPreviewClose')}
            onClick={closePreview}
          />
          <div
            ref={previewRef}
            tabIndex={-1}
            className="animate-pose-offers-modal-in relative outline-none"
          >
            <img
              src={avatarUrl}
              alt=""
              className="max-h-[85vh] max-w-[min(90vw,28rem)] rounded-2xl object-cover ring-1 ring-fuchsia-300/25 shadow-[0_40px_120px_-30px_rgba(244,114,182,0.35)]"
            />
            <button
              type="button"
              onClick={closePreview}
              className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/80 text-white/80 transition hover:bg-fuchsia-500/25 hover:text-white"
              aria-label={t('posing.account.avatarPreviewClose')}
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
