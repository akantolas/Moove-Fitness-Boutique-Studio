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
      className={`inline-flex items-center justify-center rounded-full bg-moove-lime px-5 py-2.5 text-sm font-semibold tracking-wide text-moove-ink shadow-moove-lift transition hover:bg-moove-lime-hover hover:shadow-moove-soft ${className}`}
    >
      {children}
    </Link>
  )
}

export function GhostLink({ to, children, className = '' }: GhostLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-full border border-moove-silver/35 bg-transparent px-5 py-2.5 text-sm font-medium tracking-wide text-moove-silver transition hover:border-moove-accent/50 hover:text-moove-accent ${className}`}
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
      ? 'inline-flex items-center justify-center rounded-full bg-moove-lime px-5 py-2.5 text-sm font-semibold tracking-wide text-moove-ink shadow-moove-lift transition hover:bg-moove-lime-hover hover:shadow-moove-soft'
      : 'inline-flex items-center justify-center rounded-full border border-moove-silver/35 bg-transparent px-5 py-2.5 text-sm font-medium tracking-wide text-moove-silver transition hover:border-moove-accent/50 hover:text-moove-accent'

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
