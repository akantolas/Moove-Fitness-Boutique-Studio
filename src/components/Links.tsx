import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type GhostLinkProps = {
  to: string
  children: ReactNode
  className?: string
}

export function PrimaryLink({
  to,
  children,
  className = '',
}: GhostLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-b from-moove-lime via-moove-lime to-moove-lime-deep px-6 py-3 text-sm font-semibold tracking-wide text-moove-ink shadow-moove-glow transition hover:brightness-105 active:scale-[0.98] ${className}`}
    >
      {children}
    </Link>
  )
}

export function GhostLink({ to, children, className = '' }: GhostLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-full border border-moove-espresso/15 bg-moove-surface/60 px-6 py-3 text-sm font-medium tracking-wide text-moove-silver shadow-sm backdrop-blur-sm transition hover:border-moove-accent/40 hover:bg-moove-surface hover:text-moove-accent ${className}`}
    >
      {children}
    </Link>
  )
}

type ButtonLinkProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
  external?: boolean
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className = '',
  external,
}: ButtonLinkProps) {
  const base =
    variant === 'primary'
      ? 'inline-flex items-center justify-center rounded-full bg-gradient-to-b from-moove-lime via-moove-lime to-moove-lime-deep px-6 py-3 text-sm font-semibold tracking-wide text-moove-ink shadow-moove-glow transition hover:brightness-105 active:scale-[0.98]'
      : 'inline-flex items-center justify-center rounded-full border border-moove-espresso/15 bg-moove-surface/60 px-6 py-3 text-sm font-medium tracking-wide text-moove-silver shadow-sm backdrop-blur-sm transition hover:border-moove-accent/40 hover:bg-moove-surface hover:text-moove-accent'

  return (
    <a
      href={href}
      className={`${base} ${className}`}
      {...(external
        ? { target: '_blank', rel: 'noreferrer noopener' }
        : undefined)}
    >
      {children}
    </a>
  )
}
