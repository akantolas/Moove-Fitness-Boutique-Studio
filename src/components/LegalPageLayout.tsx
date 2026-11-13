import type { ReactNode } from 'react'
import { PageHeader } from './PageHeader'
import { interpolate } from '../i18n/translate'
import type { TranslationVars } from '../i18n/types'

type LegalSection = {
  readonly title: string
  readonly body: string
}

type LegalPageLayoutProps = {
  title: string
  description: string
  lastUpdated: string
  sections: readonly LegalSection[]
  vars?: TranslationVars
  actions?: ReactNode
}

export function LegalPageLayout({
  title,
  description,
  lastUpdated,
  sections,
  vars,
  actions,
}: LegalPageLayoutProps) {
  return (
    <div className="studio studio-frame py-[clamp(3rem,2rem+4vw,6rem)]">
      <PageHeader title={title} description={description} />
      <p className="studio-small mt-8 text-moove-muted">{lastUpdated}</p>

      <div className="mt-14 max-w-[68ch] space-y-12">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-[length:var(--step-lead)] font-extrabold leading-[1.15] tracking-[-0.03em]">
              {section.title}
            </h2>
            <p className="mt-3 leading-[1.6] text-moove-muted">
              {vars ? interpolate(section.body, vars) : section.body}
            </p>
          </section>
        ))}
      </div>

      {actions ? <div className="mt-16 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}
    </div>
  )
}
