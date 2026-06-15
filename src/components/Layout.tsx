import { Link, Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

function CalendarGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      {/* Floating mobile CTA: χώρος γύρω για “premium” αίσθηση + safe area */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="pointer-events-auto px-4 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] pt-3">
          <div className="mx-auto max-w-lg rounded-2xl border border-moove-border/40 bg-moove-surface/80 p-1.5 shadow-moove-soft backdrop-blur-xl backdrop-saturate-150 ring-1 ring-white/60">
            <Link
              to="/programma"
              className="flex min-h-[3.35rem] items-center gap-2 rounded-[0.85rem] bg-gradient-to-b from-moove-lime via-moove-lime to-[#b8cf2e] px-2 py-2 text-moove-ink no-underline shadow-[0_8px_28px_-6px_rgba(120,100,40,0.35),inset_0_1px_0_0_rgba(255,255,255,0.35)] transition active:scale-[0.98] active:brightness-[0.97] sm:px-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-moove-ink/[0.12] text-moove-ink">
                <CalendarGlyph className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <span className="min-w-0 flex-1 text-center text-sm font-semibold leading-tight tracking-wide">
                Κράτηση μαθήματος
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moove-ink/[0.12] text-moove-ink/85">
                <ChevronGlyph className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
