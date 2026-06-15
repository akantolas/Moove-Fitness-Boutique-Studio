import { useCallback, useRef, useState, type ReactNode } from 'react'
import { weekSchedule } from '../data/weekSchedule'

function getInitialDayIndex() {
  const dow = new Date().getDay()
  if (dow === 0) return 0
  if (dow === 6) return 5
  return dow - 1
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function NavButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-moove-border/80 bg-moove-surface text-moove-silver shadow-sm transition hover:border-moove-lime/45 hover:bg-moove-elevated/60 disabled:pointer-events-none disabled:opacity-25"
    >
      {children}
    </button>
  )
}

export function WeekScheduleCarousel() {
  const [activeIndex, setActiveIndex] = useState(getInitialDayIndex)
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= weekSchedule.length || index === activeIndex) return
    setSlideDir(index > activeIndex ? 'right' : 'left')
    setActiveIndex(index)
  }, [activeIndex])

  const day = weekSchedule[activeIndex]
  const canGoPrev = activeIndex > 0
  const canGoNext = activeIndex < weekSchedule.length - 1

  const onTouchStart = (clientX: number) => {
    touchStartX.current = clientX
  }

  const onTouchEnd = (clientX: number) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - clientX
    if (Math.abs(delta) > 48) {
      if (delta > 0) goTo(activeIndex + 1)
      else goTo(activeIndex - 1)
    }
    touchStartX.current = null
  }

  return (
    <div className="relative mt-8">
      <div
        className="pointer-events-none absolute -inset-x-6 -top-10 -bottom-6 rounded-[2rem] opacity-90"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 55% at 18% 0%, rgba(196, 240, 49, 0.14) 0%, transparent 58%), radial-gradient(circle at 92% 88%, rgba(232, 213, 196, 0.35) 0%, transparent 42%)',
        }}
        aria-hidden
      />

      <div className="relative rounded-[1.75rem] border border-moove-border/80 bg-moove-surface/75 p-4 shadow-moove-soft ring-1 ring-white/50 backdrop-blur-sm sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <NavButton
            label="Προηγούμενη ημέρα"
            onClick={() => goTo(activeIndex - 1)}
            disabled={!canGoPrev}
          >
            <ChevronLeft />
          </NavButton>

          <div
            className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none] sm:justify-center sm:gap-2 [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Ημέρες εβδομάδας"
          >
            {weekSchedule.map((d, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={d.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => goTo(index)}
                  className={`shrink-0 rounded-xl px-3 py-2.5 text-center transition-all duration-200 sm:min-w-[4.5rem] sm:px-4 ${
                    isActive
                      ? 'bg-moove-lime text-moove-ink shadow-[0_6px_20px_-6px_rgba(120,100,40,0.45)]'
                      : 'bg-moove-elevated/50 text-moove-muted hover:bg-moove-elevated hover:text-moove-silver'
                  }`}
                >
                  <span className="block text-[10px] font-bold tracking-[0.22em]">
                    {d.short}
                  </span>
                  <span
                    className={`mt-0.5 hidden text-[11px] font-medium sm:block ${
                      isActive ? 'text-moove-ink/75' : 'text-moove-muted'
                    }`}
                  >
                    {d.label}
                  </span>
                </button>
              )
            })}
          </div>

          <NavButton
            label="Επόμενη ημέρα"
            onClick={() => goTo(activeIndex + 1)}
            disabled={!canGoNext}
          >
            <ChevronRight />
          </NavButton>
        </div>

        <div
          className="relative mt-5 overflow-hidden rounded-2xl border border-moove-border/70 bg-moove-bg/40"
          onTouchStart={(e) => onTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
        >
          <article
            key={day.key}
            className={`flex min-h-[18rem] ${
              slideDir === 'right' ? 'animate-schedule-right' : 'animate-schedule-left'
            }`}
          >
            <aside className="flex w-[4.5rem] shrink-0 flex-col items-center justify-between border-r border-moove-lime/25 bg-gradient-to-b from-moove-lime/30 via-moove-lime/18 to-moove-lime/8 py-6 sm:w-20">
              <span className="text-[10px] font-bold tracking-[0.28em] text-moove-ink/55 sm:text-xs">
                {day.short}
              </span>
              <span
                className="font-display text-[2.5rem] font-semibold leading-none text-moove-ink/20 sm:text-5xl"
                aria-hidden
              >
                {day.label.charAt(0)}
              </span>
              <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-semibold tracking-[0.18em] text-moove-ink/50 sm:text-xs">
                {day.label}
              </span>
            </aside>

            <div className="min-w-0 flex-1">
              <header className="flex items-center justify-between gap-3 border-b border-moove-border/60 px-4 py-3.5 sm:px-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-moove-muted">
                    Πρόγραμμα
                  </p>
                  <h3 className="font-display mt-0.5 text-lg font-semibold text-moove-silver sm:text-xl">
                    {day.label}
                  </h3>
                </div>
                <span className="rounded-full bg-moove-elevated px-3 py-1 text-xs font-medium text-moove-muted">
                  {day.slots.length} {day.slots.length === 1 ? 'μάθημα' : 'μαθήματα'}
                </span>
              </header>

              <ul className="divide-y divide-moove-border/50">
                {day.slots.map((slot, slotIndex) => (
                  <li
                    key={`${day.key}-${slot.time}-${slot.name}`}
                    className={`flex items-center gap-4 px-4 py-3.5 sm:px-6 sm:py-4 ${
                      slotIndex % 2 === 0 ? 'bg-transparent' : 'bg-moove-surface/35'
                    }`}
                  >
                    <span className="w-[5.5rem] shrink-0 font-mono text-xs font-medium tabular-nums text-moove-accent sm:w-28 sm:text-sm">
                      {slot.time}
                    </span>
                    <span className="h-px flex-1 bg-gradient-to-r from-moove-border/80 to-transparent" />
                    <span className="max-w-[55%] text-right text-sm font-medium leading-snug text-moove-silver sm:max-w-none sm:text-base">
                      {slot.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>

        <p className="mt-4 text-center text-xs text-moove-muted">
          <span className="sm:hidden">Σύρετε την κάρτα για άλλη ημέρα · </span>
          {activeIndex + 1} από {weekSchedule.length}
        </p>
      </div>
    </div>
  )
}
