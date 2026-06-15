import { Link } from 'react-router-dom'
import { site } from '../site'

type PosePromoBubbleProps = {
  variant: 'header' | 'menu' | 'home' | 'studio-back'
  onNavigate?: () => void
}

export function PosePromoBubble({ variant, onNavigate }: PosePromoBubbleProps) {
  const { posing } = site

  if (variant === 'studio-back') {
    const isMenu = Boolean(onNavigate)
    const shellClass = isMenu
      ? 'flex w-full items-center gap-3 rounded-2xl border border-moove-lime/35 bg-gradient-to-r from-[#121410] to-[#0e100c] px-4 py-3.5 shadow-[0_8px_32px_-12px_rgba(196,240,49,0.22)] transition hover:border-moove-lime/55'
      : 'inline-flex items-center gap-2.5 rounded-full border border-moove-lime/35 bg-[#10100c]/95 py-1.5 pl-2 pr-3 shadow-[0_4px_20px_-8px_rgba(196,240,49,0.28)] transition hover:border-moove-lime/55 hover:bg-[#141410] xl:inline-flex'

    return (
      <Link to="/" onClick={onNavigate} className={shellClass}>
        <span
          className={`flex shrink-0 items-center justify-center rounded-full bg-black/35 ring-1 ring-moove-lime/25 ${
            isMenu ? 'h-11 w-11' : 'h-8 w-8'
          }`}
          aria-hidden
        >
          <span className={`font-medium text-moove-lime ${isMenu ? 'text-base' : 'text-sm'}`}>
            ←
          </span>
        </span>
        <img
          src={site.logoMark}
          alt={site.name}
          className={`w-auto shrink-0 ${isMenu ? 'h-9' : 'h-7'}`}
          width={isMenu ? 120 : 96}
          height={isMenu ? 36 : 28}
        />
        <span className="min-w-0 text-left">
          <span
            className={`block font-semibold leading-tight text-white ${
              isMenu ? 'text-sm' : 'text-[11px] sm:text-xs'
            }`}
          >
            {site.name} Studio
          </span>
          <span
            className={`mt-0.5 block leading-snug text-moove-lime/75 ${
              isMenu ? 'text-xs' : 'hidden sm:block text-[10px]'
            }`}
          >
            Pilates & Reformer · Βόλος
          </span>
        </span>
      </Link>
    )
  }

  const sharedInner = (
    <>
      <img
        src={posing.logo}
        alt=""
        className={
          variant === 'home'
            ? 'h-14 w-auto shrink-0 sm:h-16'
            : variant === 'menu'
              ? 'h-10 w-auto shrink-0'
              : 'h-7 w-auto shrink-0'
        }
        width={variant === 'home' ? 80 : 56}
        height={variant === 'home' ? 56 : 40}
      />
      <span className="min-w-0 text-left">
        <span
          className={`block font-semibold leading-tight ${
            variant === 'home'
              ? 'text-base text-white sm:text-lg'
              : variant === 'menu'
                ? 'text-sm text-white'
                : 'text-[11px] text-white sm:text-xs'
          }`}
        >
          {posing.brandName}
        </span>
        {(variant === 'menu' || variant === 'home') && (
          <span
            className={`mt-0.5 block leading-snug text-cyan-300/80 ${
              variant === 'home' ? 'text-sm' : 'text-xs'
            }`}
          >
            Online posing coaching
          </span>
        )}
      </span>
    </>
  )

  if (variant === 'home') {
    return (
      <Link
        to="/posing"
        className="group relative flex items-center gap-5 overflow-hidden rounded-[1.75rem] border border-fuchsia-500/25 bg-[#0a0a10] p-6 shadow-[0_20px_56px_-28px_rgba(192,38,211,0.45)] transition hover:border-fuchsia-400/40 sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 80% at 0% 50%, rgba(192, 38, 211, 0.18) 0%, transparent 55%), radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.12) 0%, transparent 45%)',
          }}
          aria-hidden
        />
        <div className="relative flex flex-1 flex-col gap-5 sm:flex-row sm:items-center">
          {sharedInner}
          <p className="relative flex-1 text-sm leading-relaxed text-white/60 sm:text-base">
            Ξεχωριστή υπηρεσία για bodybuilding shows — live coaching, στάσεις και stage presence.
            Δεν σχετίζεται με τα μαθήματα του studio.
          </p>
          <span className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-black transition group-hover:brightness-110">
            Δες περισσότερα
          </span>
        </div>
      </Link>
    )
  }

  const compactClass =
    variant === 'menu'
      ? 'flex w-full items-center gap-3 rounded-2xl border border-fuchsia-500/30 bg-gradient-to-r from-[#12121a] to-[#0d1018] px-4 py-3.5 shadow-[0_8px_32px_-12px_rgba(192,38,211,0.35)] transition hover:border-fuchsia-400/45'
      : 'hidden items-center gap-2 rounded-full border border-fuchsia-500/35 bg-[#101018]/95 px-2.5 py-1.5 shadow-[0_4px_20px_-8px_rgba(192,38,211,0.4)] transition hover:border-fuchsia-400/50 hover:bg-[#14141f] xl:inline-flex'

  return (
    <Link to="/posing" onClick={onNavigate} className={compactClass}>
      {sharedInner}
      {variant === 'header' ? (
        <span className="pr-1 text-[10px] font-medium text-cyan-300/75 sm:text-[11px]" aria-hidden>
          →
        </span>
      ) : null}
    </Link>
  )
}
