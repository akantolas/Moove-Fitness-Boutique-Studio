import { useEffect, useState } from 'react'
import { site } from '../site'
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

/**
 * The studio's live Google rating, spread from margin to margin, followed by the
 * reviews themselves. Only real reviews from the Places API are shown; when the API
 * is unavailable the section points to the Google Maps profile instead.
 */
export function GoogleReviews() {
  const { t, locale } = useTranslation()
  const [data, setData] = useState<ReviewsPayload | null>(null)

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const r = await fetch('/api/reviews')
        const j: ReviewsPayload = r.ok
          ? ((await r.json()) as ReviewsPayload)
          : { ok: false, reviews: [], error: `http_${r.status}` }
        if (!cancel) setData(j)
      } catch {
        if (!cancel) setData({ ok: false, reviews: [], error: 'network' })
      }
    })()
    return () => {
      cancel = true
    }
  }, [])

  const mapsHref = data?.googleMapsUri || site.googleReviewsUrl || site.mapsUrl
  const showGoogle = Boolean(data?.ok && data.reviews.length > 0)
  const rating =
    data?.aggregateRating != null
      ? data.aggregateRating.toLocaleString(locale === 'el' ? 'el-GR' : 'en-GB', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : null

  return (
    <section className="bg-moove-espresso text-white">
      <div className="studio-frame py-[clamp(6rem,3rem+8vw,10rem)]">
        {showGoogle && rating && data?.reviewCount != null ? (
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer noopener"
            className="studio-display block text-[13vw] text-moove-lime transition-colors duration-200 hover:text-white md:text-[9vw]"
            data-reveal
          >
            <span className="studio-spread">
              <span>{rating}</span>
              <span>{t('home.reviews.stars')}</span>
            </span>
            <span className="studio-spread mt-[0.15em]">
              <span>{data.reviewCount}</span>
              <span>{t('home.reviews.reviews')}</span>
            </span>
            <span className="studio-spread mt-8 text-[length:var(--step-small)] font-semibold tracking-normal">
              <span>{t('home.reviews.source')}</span>
              <span className="hidden sm:inline">{site.name} {site.tagline}</span>
              <span>{t('common.volos')}</span>
            </span>
          </a>
        ) : null}

        <div className={`studio-grid gap-y-10 ${showGoogle ? 'mt-[clamp(5rem,3rem+5vw,8rem)]' : ''}`}>
          <h2 className="studio-head col-span-12 max-w-[12ch] lg:col-span-4">{t('home.reviews.title')}</h2>
          {showGoogle && data ? (
            <ul className="col-span-12 grid gap-x-12 gap-y-14 md:grid-cols-2 lg:col-span-8">
              {data.reviews.map((rev, i) => (
                <li key={`${rev.author}-${i}`}>
                  <figure>
                    <blockquote className="leading-[1.5]">«{rev.text}»</blockquote>
                    <figcaption className="studio-small mt-4">
                      {rev.authorUri ? (
                        <a href={rev.authorUri} target="_blank" rel="noreferrer noopener" className="hover:underline">
                          {rev.author}
                        </a>
                      ) : (
                        rev.author
                      )}
                      {rev.time ? <span className="font-normal text-white/60"> · {rev.time}</span> : null}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          ) : (
            <p className="col-span-12 lg:col-span-8">
              {data ? t('home.reviews.unavailable') : null}{' '}
            </p>
          )}
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            <a href={mapsHref} target="_blank" rel="noreferrer noopener" className="studio-link">
              {t('reviews.allOnMaps')}
            </a>
            <p className="studio-small mt-4 max-w-[60ch] font-normal text-white/60">
              {t('reviewsFallback.legal')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
