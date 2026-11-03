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
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-moove-lime px-6 py-3 text-sm font-semibold text-moove-ink transition hover:-translate-y-0.5 hover:bg-moove-lime-hover active:translate-y-0 active:scale-[0.98] ${className}`}
    >
      {children}
    </Link>
  )
}

export function GhostLink({ to, children, className = '' }: GhostLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-moove-surface px-6 py-3 text-sm font-semibold text-moove-ink transition hover:-translate-y-0.5 hover:bg-moove-elevated active:translate-y-0 active:scale-[0.98] ${className}`}
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
      ? 'inline-flex min-h-11 items-center justify-center rounded-full bg-moove-lime px-6 py-3 text-sm font-semibold text-moove-ink transition hover:-translate-y-0.5 hover:bg-moove-lime-hover active:translate-y-0 active:scale-[0.98]'
      : 'inline-flex min-h-11 items-center justify-center rounded-full bg-moove-surface px-6 py-3 text-sm font-semibold text-moove-ink transition hover:-translate-y-0.5 hover:bg-moove-elevated active:translate-y-0 active:scale-[0.98]'

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
