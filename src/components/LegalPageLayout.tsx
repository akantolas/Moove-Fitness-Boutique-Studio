import type { ReactNode } from 'react'
import { PageHeader } from './PageHeader'
import { interpolate } from '../i18n/translate'
import type { TranslationVars } from '../i18n/types'

type LegalSection = {
  readonly title: string
  readonly body: string
}

type LegalPageLayoutProps = {
  eyebrow: string
  title: string
  description: string
  lastUpdated: string
  sections: readonly LegalSection[]
  vars?: TranslationVars
  actions?: ReactNode
}

export function LegalPageLayout({
  eyebrow,
  title,
  description,
  lastUpdated,
  sections,
  vars,
  actions,
}: LegalPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <p className="mt-8 text-sm text-moove-muted">{lastUpdated}</p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="moove-card p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-moove-silver">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-moove-muted sm:text-base">
              {vars ? interpolate(section.body, vars) : section.body}
            </p>
          </section>
        ))}
      </div>

      {actions ? <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
    </div>
  )
}

export function legalGhostLinkClassName() {
  return 'inline-flex min-h-11 items-center justify-center rounded-full border border-moove-espresso/15 bg-moove-surface/60 px-6 py-3 text-sm font-medium text-moove-silver transition hover:border-moove-accent/40 hover:bg-moove-surface hover:text-moove-accent'
}

export function legalPrimaryLinkClassName() {
  return 'inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-b from-moove-lime via-moove-lime to-moove-lime-deep px-6 py-3 text-sm font-semibold text-moove-ink shadow-moove-glow transition hover:brightness-105 active:scale-[0.98]'
}
