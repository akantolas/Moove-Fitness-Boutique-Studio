import type { ReactNode } from 'react'

export type SiteContainerVariant = 'marketing' | 'app' | 'auth' | 'admin'

const variantClass: Record<SiteContainerVariant, string> = {
  marketing: 'moove-site-container-wide',
  app: 'moove-site-container',
  auth: 'moove-site-container',
  admin: 'moove-site-container-wide',
}

type SiteContainerProps = {
  variant?: SiteContainerVariant
  children: ReactNode
  className?: string
  as?: 'div' | 'main' | 'section'
}

export function SiteContainer({
  variant = 'marketing',
  children,
  className = '',
  as: Tag = 'div',
}: SiteContainerProps) {
  const classes = [variantClass[variant], className].filter(Boolean).join(' ')
  return <Tag className={classes}>{children}</Tag>
}
