import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ClassSlideshow } from '../components/ClassSlideshow'
import { GoogleReviews } from '../components/GoogleReviews'
import { StudioTimetable } from '../components/StudioTimetable'
import { useReveal } from '../hooks/useReveal'
import { useStudioStatus } from '../hooks/useStudioStatus'
import { findNextClass } from '../lib/nextClass'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { site } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

const bookingProps = site.bookingUrl.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : undefined

export function HomePage() {
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()
  const now = useCurrentTime()
  const status = useStudioStatus()
  const next = useMemo(() => findNextClass(now), [now])
  const home = dictionary.home
  const days = dictionary.schedule.days

  useReveal()

  const nextWhen = next
    ? next.daysAhead === 0
      ? t('home.hero.today')
      : next.daysAhead === 1
        ? t('home.hero.tomorrow')
        : days[next.day.key].label
    : ''

  return (
    <div className="studio">
      {/* Hero: the name with a photograph in its word space, which then opens to full width */}
      <section className="studio-frame pt-[clamp(2.5rem,8vh,5.5rem)]">
        <h1 className="studio-display studio-name">
          <span>{site.name}</span>
          <img
            src="/magda-cutout.webp?v=5"
            alt={t('home.hero.heroImageAlt')}
            width={795}
            height={1000}
            fetchPriority="high"
            className="studio-name__person"
          />
          <span>Pilates</span>
          <span className="sr-only"> — {t('home.hero.titleHidden')}</span>
        </h1>

        <div className="studio-grid mt-10 gap-y-8 md:mt-14 md:items-end">
          <div className="studio-rise col-span-12 md:col-span-5 [animation-delay:500ms]">
            {next ? (
              <p className="studio-small text-moove-muted">
                {t('home.hero.nextLabel')}
                <span className="mt-1 block text-[length:var(--step-lead)] font-semibold tracking-[-0.02em] text-moove-ink">
                  {next.slot.name}, {nextWhen} {next.slot.time}
                </span>
              </p>
            ) : null}
            <a href="#programma" className="studio-link mt-3 inline-block text-[length:var(--step-small)]">
              {t('home.hero.fullSchedule')}
            </a>
          </div>
          <div className="studio-rise col-span-12 md:col-span-7 md:flex md:items-end md:justify-between md:gap-8 [animation-delay:650ms]">
            <p className="max-w-[34ch] text-[length:var(--step-body)] leading-[1.45]">{t('home.hero.body')}</p>
            <a href={site.bookingUrl} {...bookingProps} className="studio-button mt-6 shrink-0 md:mt-0">
              {t('common.bookSpot')}
            </a>
          </div>
        </div>
      </section>

      <figure className="studio-frame mt-14 hidden md:block">
        <div className="studio-band">
          <img
            src="/image1.jpeg"
            alt={t('home.hero.photoAlt')}
            width={1349}
            height={1500}
            className="h-full w-full object-cover object-[50%_42%]"
          />
        </div>
      </figure>

      {/* The studio at a glance, on black */}
      <section className="mt-14 bg-moove-espresso text-white">
        <div className="studio-frame py-14 md:py-20">
          <h2 className="sr-only">{t('home.facts.title')}</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4" data-reveal>
            {home.facts.items.map((fact) => (
              <div key={fact.label} className="flex flex-col-reverse">
                <dt className="studio-small mt-2 text-white/70">{fact.label}</dt>
                <dd className="font-display text-[clamp(1.6rem,1rem+2vw,3rem)] font-extrabold leading-[1] tracking-[-0.04em] text-moove-lime">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The week's timetable: the room on the left, the day's classes on the right */}
      <section id="programma" className="scroll-mt-16 bg-moove-surface">
        <div className="studio-frame studio-grid gap-y-12 py-[var(--section-gap)]">
          <div className="col-span-12 md:col-span-5">
            <img
              src="/image6.jpeg"
              alt={t('home.schedule.imageAlt')}
              width={1440}
              height={1800}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover md:sticky md:top-24"
            />
          </div>

          <div className="col-span-12 md:col-span-7 md:pl-[2vw]">
            <div data-reveal>
              <h2 className="studio-head max-w-[13ch]">{t('home.schedule.title')}</h2>
            </div>
            <div className="mt-10">
              <StudioTimetable next={next} />
            </div>
            <p className="mt-8 max-w-[44ch] text-moove-muted">{t('home.schedule.note')}</p>
          </div>
        </div>
      </section>

      {/* Magda: a large portrait beside the statement */}
      <section className="bg-moove-espresso text-white">
        <div className="studio-frame studio-grid gap-y-10 py-[clamp(4rem,2rem+6vw,8rem)] md:items-center">
          <div className="col-span-12 md:col-span-5">
            <img
              src="/magda-4x5.jpg"
              alt={t('home.magda.portraitAlt')}
              width={620}
              height={775}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="col-span-12 md:col-span-7 md:pl-[2vw]" data-reveal>
            <h2 className="studio-head max-w-[10ch]">{t('home.magda.name')}</h2>
            <p className="studio-lead mt-8 max-w-[30ch]">{t('home.magda.lead')}</p>
            <p className="mt-6 max-w-[52ch] leading-[1.5]">
              {t('home.magda.specialty')}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {home.magda.facts.map((fact) => (
                <li key={fact} className="studio-small rounded-full bg-white/10 px-4 py-2">
                  {fact}
                </li>
              ))}
            </ul>
            <Link to="/sxetika" className="studio-button mt-10">
              {t('home.magda.readMore')}
            </Link>
          </div>
        </div>
      </section>

      {/* Classes: hover or tap a title and its photograph wipes in beside it */}
      <section className="bg-moove-surface">
        <div className="studio-frame py-[var(--section-gap)]">
          <div data-reveal>
            <h2 className="studio-head max-w-[12ch]">{t('home.classes.title')}</h2>
          </div>

          <ClassSlideshow />

          <div className="mt-20">
            <Link to="/mathimata" className="studio-button studio-button--ink">
              {t('home.classes.viewProgram')}
            </Link>
          </div>
        </div>
      </section>

      {/* How to start, on the brand's lime */}
      <section className="bg-moove-lime">
        <div className="studio-frame studio-grid gap-y-12 py-[clamp(4rem,2rem+6vw,8rem)]">
          <div className="col-span-12 md:col-span-5" data-reveal>
            <h2 className="studio-head">{t('home.start.title')}</h2>
            <a href={site.bookingUrl} {...bookingProps} className="studio-button studio-button--ink mt-10">
              {t('home.start.cta')}
            </a>
            <p className="studio-small mt-6">
              {t('home.start.call')}{' '}
              <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="studio-link">
                {site.phone}
              </a>
            </p>
          </div>
          <ol className="col-span-12 space-y-10 md:col-span-7" data-reveal>
            {home.start.steps.map((step) => (
              <li key={step} className="studio-lead max-w-[28ch] font-semibold">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The address is the way in: the words link to the map, with prints of the room dealt around them */}
      <section className="overflow-clip bg-moove-elevated">
        <div
          className="studio-frame relative flex flex-col pb-[60vw] pt-[60vw] md:min-h-[max(calc(100svh-4rem),38rem)] md:pb-10 md:pt-12"
          data-reveal="late"
        >
          <h2 className="studio-display studio-place relative z-10 text-center text-[calc((100vw-2*var(--gutter))/3.6)] uppercase leading-[0.85] md:my-auto md:text-[clamp(7.5rem,15vw,15rem)]">
            <a href={site.mapsUrl} target="_blank" rel="noreferrer noopener">
              <span className="studio-place__line">{t('home.place.line1')}</span>
              <br />
              <span className="studio-place__line">{t('home.place.line2')}</span>
              <span className="studio-place__city">
                {t('home.place.line3')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                  <path d="M6 18 18 6M8 6h10v10" />
                </svg>
              </span>
              <span className="sr-only">, {t('home.place.map')}</span>
            </a>
          </h2>
          <figure className="studio-print left-[var(--gutter)] top-[4vw] w-[38vw] -rotate-6 [--deal:0] md:top-[7%] md:w-[min(18vw,17rem,28svh)] md:-rotate-[8deg]">
            <img src="/image6.jpeg" alt={t('home.place.altRoom')} loading="lazy" />
          </figure>
          <figure className="studio-print right-[9%] top-[5%] hidden w-[min(11vw,11rem,18svh)] rotate-3 [--deal:1] md:block">
            <img src="/class-dance.jpg" alt={t('home.place.altWall')} loading="lazy" />
          </figure>
          <figure className="studio-print bottom-[6vw] right-[var(--gutter)] w-[38vw] rotate-[5deg] [--deal:2] md:bottom-[17%] md:w-[min(18vw,17rem,28svh)] md:rotate-6">
            <img src="/image1.jpeg" alt={t('home.place.altClass')} loading="lazy" />
          </figure>
          <div className="relative z-10 mt-10 flex flex-col gap-6 md:mt-0 md:flex-row md:items-end md:justify-between md:gap-10">
            <p className="max-w-[36ch]">{t('home.place.body')}</p>
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:gap-8">
              <p className="studio-small">
                {vars.address}
                {status.text ? (
                  <span className="mt-1 flex items-center gap-2.5 font-semibold">
                    <i className="studio-dot" data-open={status.open ? 'true' : 'false'} aria-hidden />
                    {status.text}
                  </span>
                ) : null}
              </p>
              <a href={site.mapsUrl} target="_blank" rel="noreferrer noopener" className="studio-button shrink-0 self-start md:self-auto">
                {t('home.place.map')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <GoogleReviews />

      {/* Questions people ask before their first class */}
      <section className="studio-frame py-[var(--section-gap)]">
        <div className="studio-grid gap-y-10">
          <div className="col-span-12 lg:col-span-4" data-reveal>
            <h2 className="studio-head max-w-[10ch]">{t('home.faq.title')}</h2>
          </div>
          <div className="col-span-12 space-y-2 lg:col-span-8">
            {home.faq.items.map((item) => (
              <details key={item.q} className="studio-faq group">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 px-5 py-5 text-[length:var(--step-lead)] font-semibold leading-[1.2] tracking-[-0.02em] md:px-7">
                  {item.q}
                  <span
                    className="shrink-0 text-[1.5em] leading-none transition-transform duration-200 group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-[60ch] px-5 pb-6 leading-[1.55] md:px-7">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact: the email address as display type */}
      <section className="bg-moove-espresso text-white">
        <div className="studio-frame flex min-h-[70svh] flex-col justify-between gap-16 py-12 md:min-h-[80svh] md:py-16">
          <h2 className="studio-lead max-w-[24ch] font-semibold" data-reveal>
            <span>{t('home.contact.title')}</span>
          </h2>
          <div>
            <a
              href={`mailto:${site.email}`}
              className="studio-display block break-words text-[11.5vw] leading-[0.95] tracking-[-0.06em] transition-colors duration-200 hover:text-moove-lime md:text-[calc((min(100vw,96rem)-2*var(--gutter))/10.6)] md:font-semibold"
            >
              {site.email.split('@')[0]}@<wbr />
              {site.email.split('@')[1]}
            </a>
            <div className="studio-small mt-10 flex flex-col gap-6 text-white/80 md:flex-row md:justify-between">
              <ul className="space-y-1">
                <li>
                  <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-moove-lime">
                    {site.phone}
                  </a>
                </li>
                <li>{vars.address}</li>
                <li>{t('contact.hoursValue')}</li>
              </ul>
              <ul className="flex gap-6 md:items-end">
                <li>
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-moove-lime"
                  >
                    {t('common.instagram')}
                  </a>
                </li>
                <li>
                  <a
                    href={site.social.facebook}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="hover:text-moove-lime"
                  >
                    {t('common.facebook')}
                  </a>
                </li>
                <li>
                  <a href={site.mapsUrl} target="_blank" rel="noreferrer noopener" className="hover:text-moove-lime">
                    {t('common.googleMaps')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
