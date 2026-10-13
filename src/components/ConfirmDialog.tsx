import { useEffect, useId, useRef, type ReactNode } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  cancelLabel: string
  busy?: boolean
  destructive?: boolean
  confirmDisabled?: boolean
  children?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  busy = false,
  destructive = false,
  confirmDisabled = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const field =
      containerRef.current?.querySelector<HTMLElement>('textarea,input')
    const action = containerRef.current?.querySelector<HTMLElement>(
      'button:not([disabled])',
    )
    ;(field ?? action)?.focus()
    return () => previous?.focus()
  }, [open])
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !busy) {
          event.preventDefault()
          onCancel()
        }
        if (event.key !== 'Tab') return
        const controls = [
          ...(containerRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled])',
          ) ?? []),
        ]
        const first = controls[0],
          last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label={cancelLabel}
        disabled={busy}
        onClick={onCancel}
      />
      <div
        ref={containerRef}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c12] p-6 shadow-2xl"
      >
        <h3 id={titleId} className="text-lg font-semibold text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm text-white/60">{body}</p>
        {children}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy || confirmDisabled}
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
              destructive
                ? 'border border-rose-300/40 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30'
                : 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black hover:brightness-110'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
