import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProgramAccess, type ProgramAccessContent } from '../lib/programsApi'
import { useTranslation } from '../i18n/useTranslation'

function VideoEmbed({ videoId, title }: { videoId: string; title: string }) {
  const { t } = useTranslation()
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    return (
      <button
        type="button"
        onClick={() => setLoaded(true)}
        className="flex aspect-video w-full items-center justify-center rounded-xl border border-moove-border/80 bg-moove-espresso/5 text-sm font-medium text-moove-muted transition hover:bg-moove-espresso/10"
      >
        {t('programs.access.loadVideo')} — {title}
      </button>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-moove-border/80 bg-black">
      <iframe
        title={title}
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

export function ProgramAccessPage() {
  const { token } = useParams<{ token: string }>()
  const { t, locale } = useTranslation()
  const [content, setContent] = useState<ProgramAccessContent | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    setLoading(true)
    setError('')
    fetchProgramAccess(token, locale)
      .then((data) => {
        setContent({
          title: data.title,
          programKey: data.programKey,
          meta: data.meta,
          sections: data.sections,
        })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'access_failed')
      })
      .finally(() => setLoading(false))
  }, [token, locale])

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-moove-silver">
          {t('programs.access.notFoundTitle')}
        </h1>
        <p className="mt-3 text-sm text-moove-muted">{t('programs.access.notFoundBody')}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-moove-muted">
        {t('programs.access.loading')}
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-moove-silver">
          {t('programs.access.notFoundTitle')}
        </h1>
        <p className="mt-3 text-sm text-moove-muted">{t('programs.access.notFoundBody')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="moove-eyebrow">{t('programs.access.eyebrow')}</p>
      <h1 className="font-display mt-3 text-3xl font-semibold text-moove-silver sm:text-4xl">
        {content.title}
      </h1>
      <p className="mt-4 text-sm text-moove-muted">{t('programs.access.privateNote')}</p>

      {content.meta ? (
        <dl className="mt-8 space-y-4 rounded-2xl border border-moove-border/80 bg-moove-espresso/[0.03] p-6">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-moove-muted/80">
              {t('programs.access.metaDuration')}
            </dt>
            <dd className="mt-1 text-sm text-moove-silver">{content.meta.duration}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-moove-muted/80">
              {t('programs.access.metaGoal')}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-moove-muted">{content.meta.goal}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-moove-muted/80">
              {t('programs.access.metaProgress')}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-moove-muted">
              {content.meta.progressNote}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-12 space-y-10">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold text-moove-silver">{section.title}</h2>
            <div className="mt-6 space-y-8">
              {section.exercises.map((exercise) => (
                <article
                  key={`${section.title}-${exercise.name}`}
                  className="rounded-2xl border border-moove-border/80 p-5 sm:p-6"
                >
                  <h3 className="font-display text-lg font-semibold text-moove-silver">
                    {exercise.name}
                  </h3>
                  {exercise.sets ? (
                    <p className="mt-1 text-sm text-moove-muted">
                      {t('programs.access.sets')}: {exercise.sets}
                    </p>
                  ) : null}
                  {exercise.notes ? (
                    <p className="mt-2 text-sm leading-relaxed text-moove-muted">{exercise.notes}</p>
                  ) : null}
                  {exercise.videoId ? (
                    <div className="mt-4">
                      <VideoEmbed videoId={exercise.videoId} title={exercise.name} />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
