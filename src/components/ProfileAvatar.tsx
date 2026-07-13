import { useRef, useState, type ChangeEvent } from 'react'
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
  const [localError, setLocalError] = useState('')
  const initials = getProfileInitials(fullName, email)

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

  return (
    <div className={editable ? 'flex flex-col items-center gap-3' : 'shrink-0'}>
      <div className="relative">
        <div
          className={`relative flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500/80 to-cyan-400/80 font-semibold text-black ring-fuchsia-300/40 ${sizeClasses[size]} ${busy ? 'opacity-60' : ''}`}
        >
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
        {editable && !busy ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white/80 transition hover:bg-fuchsia-500/30 hover:text-white"
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
    </div>
  )
}
