import { useTranslation } from '../i18n/useTranslation'

type PeachSculptGuidelinesProps = {
  variant?: 'marketing' | 'access'
}

type TechniqueItem = {
  title: string
  body: string
  example?: string
  note?: string
}

function GuidelineCard({
  title,
  body,
  example,
  note,
  exampleLabel,
  noteLabel,
}: TechniqueItem & { exampleLabel: string; noteLabel: string }) {
  return (
    <article className="rounded-2xl border border-moove-border/80 bg-moove-espresso/[0.03] p-5 sm:p-6">
      <h3 className="font-display text-lg font-semibold text-moove-silver">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-moove-muted">{body}</p>
      {example ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-moove-muted/80">{exampleLabel}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-moove-silver">{example}</p>
        </div>
      ) : null}
      {note ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-moove-muted/80">{noteLabel}</p>
          <p className="mt-1 text-sm leading-relaxed text-moove-muted">{note}</p>
        </div>
      ) : null}
    </article>
  )
}

export function PeachSculptGuidelines({ variant = 'marketing' }: PeachSculptGuidelinesProps) {
  const { dictionary } = useTranslation()
  const guidelines = dictionary.programs.sculptGuidelines
  const isMarketing = variant === 'marketing'

  if (!isMarketing) {
    return (
      <details className="group mt-6 overflow-hidden rounded-[1.5rem] border border-moove-border/80 bg-moove-surface shadow-moove-lift">
        <summary className="flex cursor-pointer list-none items-center gap-4 p-5 marker:hidden sm:p-7">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moove-lime/25 text-lg text-moove-espresso">
            i
          </span>
          <span className="min-w-0 flex-1">
            <span className="moove-eyebrow">{guidelines.eyebrow}</span>
            <span className="font-display mt-1 block text-xl font-semibold text-moove-silver">
              {guidelines.title}
            </span>
          </span>
          <svg
            className="h-5 w-5 shrink-0 text-moove-muted transition-transform duration-300 group-open:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>

        <div className="border-t border-moove-border/70 p-5 sm:p-7">
          <h3 className="font-display text-xl font-semibold text-moove-silver">{guidelines.methodsTitle}</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {guidelines.methods.map((method) => (
              <article key={method.title} className="rounded-2xl bg-moove-bg/70 p-5">
                <h4 className="font-display text-lg font-semibold text-moove-silver">{method.title}</h4>
                <p className="mt-2 text-sm leading-7 text-moove-muted">{method.body}</p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-moove-accent">
                  {guidelines.applicationLabel}
                </p>
                <p className="mt-1 text-sm leading-7 text-moove-silver">{method.application}</p>
              </article>
            ))}
          </div>

          <article className="mt-4 rounded-2xl bg-moove-espresso p-5 text-white">
            <h3 className="font-display text-lg font-semibold">{guidelines.whyTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-white/75">{guidelines.whyBody}</p>
          </article>

          <h3 className="font-display mt-7 text-xl font-semibold text-moove-silver">
            {guidelines.techniquesTitle}
          </h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {guidelines.techniques.map((technique) => (
              <GuidelineCard
                key={technique.title}
                {...technique}
                exampleLabel={guidelines.exampleLabel}
                noteLabel={guidelines.noteLabel}
              />
            ))}
          </div>
        </div>
      </details>
    )
  }

  return (
    <section className={isMarketing ? 'mt-10' : 'mt-8'}>
      <div className={isMarketing ? 'max-w-2xl' : undefined}>
        <p className="moove-eyebrow">{guidelines.eyebrow}</p>
        <h2
          className={`font-display font-semibold text-moove-silver ${
            isMarketing ? 'mt-3 text-2xl sm:text-3xl' : 'mt-3 text-2xl sm:text-3xl'
          }`}
        >
          {guidelines.title}
        </h2>
      </div>

      <div className="mt-8">
        <h3 className="font-display text-lg font-semibold text-moove-silver">{guidelines.methodsTitle}</h3>
        <div className={`mt-4 space-y-5 ${isMarketing ? 'lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0' : ''}`}>
          {guidelines.methods.map((method) => (
            <article
              key={method.title}
              className="rounded-2xl border border-moove-border/80 bg-moove-espresso/[0.03] p-5 sm:p-6"
            >
              <h4 className="font-display text-lg font-semibold text-moove-silver">{method.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-moove-muted">{method.body}</p>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-moove-muted/80">
                  {guidelines.applicationLabel}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-moove-silver">{method.application}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-moove-border/80 bg-moove-espresso/[0.03] p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-moove-silver">{guidelines.whyTitle}</h3>
        <p className="mt-3 text-sm leading-relaxed text-moove-muted">{guidelines.whyBody}</p>
      </div>

      <div className="mt-8">
        <h3 className="font-display text-lg font-semibold text-moove-silver">{guidelines.techniquesTitle}</h3>
        <div
          className={`mt-4 space-y-5 ${isMarketing ? 'lg:grid lg:grid-cols-3 lg:gap-5 lg:space-y-0' : ''}`}
        >
          {guidelines.techniques.map((technique) => (
            <GuidelineCard
              key={technique.title}
              {...technique}
              exampleLabel={guidelines.exampleLabel}
              noteLabel={guidelines.noteLabel}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
