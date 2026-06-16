import { useEffect, useState } from 'react'
import { site } from '../site'
import { ButtonLink } from './Links'
import { useTranslation } from '../i18n/useTranslation'

type ReviewItem = {
  author: string
  authorUri: string | null
  rating: number | null
  text: string
  time: string
}

type ReviewsPayload = {
  ok: boolean
  error?: string
  displayName?: string | null
  aggregateRating?: number | null
  reviewCount?: number | null
  googleMapsUri?: string | null
  reviews: ReviewItem[]
}

function Stars({ rating, label }: { rating: number; label: string }) {
  const full = Math.round(rating)
  return (
    <span className="text-moove-lime" aria-label={label}>
      {'★'.repeat(full)}
      <span className="text-moove-border">{'★'.repeat(Math.max(0, 5 - full))}</span>
    </span>
  )
}

export function GoogleReviews() {
  const { t, dictionary } = useTranslation()
  const [data, setData] = useState<ReviewsPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const r = await fetch('/api/reviews')
        let j: ReviewsPayload
        if (!r.ok) {
          j = { ok: false, reviews: [], error: `http_${r.status}` }
        } else {
          j = (await r.json()) as ReviewsPayload
        }
        if (!cancel) setData(j)
      } catch {
        if (!cancel) setData({ ok: false, reviews: [], error: 'network' })
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [])

  const mapsHref = data?.googleMapsUri || site.googleReviewsUrl || site.mapsUrl
  const showGoogle = Boolean(data?.ok && data.reviews.length > 0)
  const apiPending = !loading && !showGoogle

  return (
    <section className="border-b border-moove-border/80 bg-gradient-to-b from-moove-elevated/40 to-moove-bg moove-section-pad">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="moove-eyebrow">{t('reviews.eyebrow')}</p>
          <h2 className="font-display mt-4 text-3xl font-semibold text-moove-silver sm:text-4xl">
            {t('reviews.title')}
          </h2>
          {apiPending ? (
            <p className="mx-auto mt-3 max-w-lg text-center text-sm text-moove-muted">
              {t('reviews.mapsHint')}{' '}
              <a
                href={mapsHref}
                className="text-moove-accent underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer noopener"
              >
                {t('reviews.viewProfile')}
              </a>
              .
            </p>
          ) : null}
          {(data?.aggregateRating != null || data?.reviewCount != null) && showGoogle ? (
            <p className="mx-auto mt-3 text-center text-sm text-moove-muted">
              {data.aggregateRating != null ? (
                <>
                  <span className="font-semibold text-moove-silver">
                    {data.aggregateRating.toFixed(1)}
                  </span>{' '}
                  {t('reviews.onGoogle')}
                  {data.reviewCount != null ? (
                    <>
                      {' '}
                      · {data.reviewCount} {t('reviews.reviewCount')}
                    </>
                  ) : null}
                </>
              ) : null}
            </p>
          ) : null}
          <div className="moove-rule mx-auto mt-6" aria-hidden />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {loading ? (
            <>
              <div className="h-40 animate-pulse rounded-3xl bg-moove-border/40" />
              <div className="h-40 animate-pulse rounded-3xl bg-moove-border/40" />
            </>
          ) : showGoogle && data ? (
            data.reviews.map((rev, i) => (
              <figure
                key={`${rev.author}-${i}`}
                className="moove-card p-8 transition hover:shadow-moove-soft"
              >
                {rev.rating != null ? (
                  <div className="mb-3 text-sm">
                    <Stars
                      rating={rev.rating}
                      label={t('reviews.starsAria', { rating: rev.rating })}
                    />
                  </div>
                ) : null}
                <blockquote className="text-moove-muted leading-relaxed">
                  {rev.text ? `«${rev.text}»` : '—'}
                </blockquote>
                <figcaption className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold text-moove-accent">
                    {rev.authorUri ? (
                      <a
                        href={rev.authorUri}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="hover:underline"
                      >
                        {rev.author}
                      </a>
                    ) : (
                      rev.author
                    )}
                  </span>
                  {rev.time ? <span className="text-moove-muted/80">· {rev.time}</span> : null}
                </figcaption>
              </figure>
            ))
          ) : (
            dictionary.reviewsFallback.items.map((item) => (
              <figure
                key={item.name}
                className="moove-card p-8 transition hover:shadow-moove-soft"
              >
                <blockquote className="text-moove-muted leading-relaxed">
                  «{item.quote}»
                </blockquote>
                <figcaption className="mt-6 text-sm font-semibold text-moove-accent">
                  {item.name}
                </figcaption>
                <p className="mt-2 text-xs text-moove-muted">
                  {data?.error === 'missing_api_key'
                    ? t('reviewsFallback.apiKeyHint')
                    : data?.error
                      ? t('reviewsFallback.tempHint')
                      : null}
                </p>
              </figure>
            ))
          )}
        </div>

        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-xs leading-relaxed text-moove-muted">
            {t('reviewsFallback.legal')}{' '}
            <a
              href={mapsHref}
              className="text-moove-accent underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              {t('reviewsFallback.mapsProfile')}
            </a>
            .
          </p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href={mapsHref} external variant="ghost">
              {t('reviews.allOnMaps')}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
