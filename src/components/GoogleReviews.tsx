import { useEffect, useState } from 'react'
import { site } from '../site'
import { ButtonLink } from './Links'

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

const fallbackTestimonials = [
  {
    quote:
      'Ήσυχο studio, καταλαβαίνουν τι κάνεις. Σε λίγες εβδομάδες ένιωσα διαφορά στη στάση μου.',
    name: 'Μαρία Κ.',
  },
  {
    quote:
      'Έρχομαι εδώ και καιρό. Μικρά γκρουπ, προσοχή στη λεπτομέρεια, δεν αφήνουν κανέναν να κάνει λάθος χωρίς να το διορθώσουν.',
    name: 'Νίκος Π.',
  },
] as const

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="text-moove-lime" aria-label={`${rating} στα 5 αστέρια`}>
      {'★'.repeat(full)}
      <span className="text-moove-border">{'★'.repeat(Math.max(0, 5 - full))}</span>
    </span>
  )
}

export function GoogleReviews() {
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
          <p className="moove-eyebrow">Κριτικές</p>
          <h2 className="font-display mt-4 text-3xl font-semibold text-moove-silver sm:text-4xl">
            Τι λένε οι ασκούμενοι
          </h2>
        {apiPending ? (
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-moove-muted">
            Δες τι γράφουν στο Google Maps —{' '}
            <a
              href={mapsHref}
              className="text-moove-accent underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              δείτε το προφίλ μας
            </a>
            .
          </p>
        ) : null}
        {(data?.aggregateRating != null || data?.reviewCount != null) &&
        showGoogle ? (
          <p className="mx-auto mt-3 text-center text-sm text-moove-muted">
            {data.aggregateRating != null ? (
              <>
                <span className="font-semibold text-moove-silver">
                  {data.aggregateRating.toFixed(1)}
                </span>{' '}
                / 5 στο Google
                {data.reviewCount != null ? (
                  <> · {data.reviewCount} κριτικές</>
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
                    <Stars rating={rev.rating} />
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
                  {rev.time ? (
                    <span className="text-moove-muted/80">· {rev.time}</span>
                  ) : null}
                </figcaption>
              </figure>
            ))
          ) : (
            fallbackTestimonials.map((t) => (
              <figure
                key={t.name}
                className="moove-card p-8 transition hover:shadow-moove-soft"
              >
                <blockquote className="text-moove-muted leading-relaxed">
                  «{t.quote}»
                </blockquote>
                <figcaption className="mt-6 text-sm font-semibold text-moove-accent">
                  {t.name}
                </figcaption>
                <p className="mt-2 text-xs text-moove-muted">
                  {data?.error === 'missing_api_key'
                    ? 'Για να φορτώνουν αυτόματα οι κριτικές: Vercel + GOOGLE_PLACES_API_KEY (βλ. .env.example).'
                    : data?.error
                      ? 'Προσωρινά δείχνουμε ενδεικτικά σχόλια — όλες οι κριτικές είναι στο Google.'
                      : null}
                </p>
              </figure>
            ))
          )}
        </div>

        <div className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-xs leading-relaxed text-moove-muted">
            Οι κριτικές από το Google εμφανίζονται σύμφωνα με τους όρους της Google και
            μερικές φορές δεν είναι διαθέσιμες μέσω API. Όλα τα σχόλια μένουν πάντα στο{' '}
            <a
              href={mapsHref}
              className="text-moove-accent underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              προφίλ στο Google Maps
            </a>
            .
          </p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href={mapsHref} external variant="ghost">
              Όλες οι κριτικές στο Google Maps
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
