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

type AuthPageShellProps = {
  children: ReactNode
  className?: string
}

export function AuthPageShell({ children, className = '' }: AuthPageShellProps) {
  return (
    <SiteContainer className={`py-16 sm:py-20 ${className}`.trim()}>
      <div className="mx-auto max-w-md rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_70px_-48px_rgba(244,114,182,0.85)] backdrop-blur-sm sm:p-8">
        {children}
      </div>
    </SiteContainer>
  )
}
