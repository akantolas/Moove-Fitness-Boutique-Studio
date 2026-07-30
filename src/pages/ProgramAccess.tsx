import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { fetchProgramAccess, type ProgramAccessContent } from '../lib/programsApi'
import { useTranslation } from '../i18n/useTranslation'
import { PeachSculptGuidelines } from '../components/PeachSculptGuidelines'
import { SiteContainer } from '../components/SiteContainer'
import { mooveProgramCatalog } from '../data/moovePrograms'
import {
  formatProgramPrescription,
  type PrescriptionLabels,
} from '../lib/programPrescription'

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      className={`h-5 w-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m8 5 11 7-11 7V5Z" />
    </svg>
  )
}

function VideoEmbed({ videoId, title }: { videoId: string; title: string }) {
  const { t } = useTranslation()
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    return (
      <button
        type="button"
        onClick={() => setLoaded(true)}
        className="group flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-moove-border/80 bg-moove-espresso/[0.035] text-sm font-semibold text-moove-silver transition hover:border-moove-lime-deep/40 hover:bg-moove-lime/10"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-moove-espresso text-moove-lime shadow-moove-lift transition group-hover:scale-105">
          <PlayIcon />
        </span>
        <span>{t('programs.access.loadVideo')} — {title}</span>
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
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, locale } = useTranslation()
  const [content, setContent] = useState<ProgramAccessContent | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(() => new Set([0]))
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    if (!token) return

    let active = true
    const requestedWorkout = searchParams.get('workout') ?? undefined

    fetchProgramAccess(token, locale, requestedWorkout)
      .then((data) => {
        if (!active) return
        setContent(data)
        setError('')
        setExpandedSections(new Set([0]))
        setActiveSection(0)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'access_failed')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, locale, searchParams])

  function toggleSection(index: number) {
    setActiveSection(index)
    setExpandedSections((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function navigateToSection(index: number) {
    setActiveSection(index)
    setExpandedSections((current) => new Set(current).add(index))
    window.requestAnimationFrame(() => {
      document.getElementById(`program-section-${index}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  if (!token) {
    return (
      <div className="program-portal-shell px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-moove-border/80 bg-moove-surface p-8 text-center shadow-moove-soft sm:p-12">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moove-espresso text-moove-lime">
            <LockIcon />
          </span>
          <h1 className="font-display mt-6 text-3xl font-semibold text-moove-silver">
            {t('programs.access.notFoundTitle')}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-moove-muted">{t('programs.access.notFoundBody')}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="program-portal-shell px-4 py-10 sm:px-6 sm:py-16">
        <SiteContainer variant="app" className="animate-pulse">
          <div className="h-[26rem] rounded-[2rem] bg-moove-espresso/15 sm:h-[30rem]" />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="h-40 rounded-2xl bg-moove-espresso/[0.07]" />
            <div className="h-40 rounded-2xl bg-moove-espresso/[0.07]" />
          </div>
          <p className="mt-6 text-center text-sm font-medium text-moove-muted">{t('programs.access.loading')}</p>
        </SiteContainer>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="program-portal-shell px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-lg rounded-[2rem] border border-moove-border/80 bg-moove-surface p-8 text-center shadow-moove-soft sm:p-12">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moove-espresso text-moove-lime">
            <LockIcon />
          </span>
          <h1 className="font-display mt-6 text-3xl font-semibold text-moove-silver">
            {t('programs.access.notFoundTitle')}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-moove-muted">{t('programs.access.notFoundBody')}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-moove-accent">
            {t('programs.access.errorSupport')}
          </p>
        </div>
      </div>
    )
  }

  const catalogProgram = mooveProgramCatalog.find((program) => program.key === content.programKey)
  const heroImage = catalogProgram?.imagePath ?? '/programs/peach-workout-c-cover.png'
  const heroPosition = catalogProgram?.imagePosition ?? 'center 40%'
  const levelLabel = catalogProgram ? t(`programs.levels.${catalogProgram.levelKey}`) : null
  const prescriptionLabels: PrescriptionLabels = {
    repetitions: t('programs.access.prescription.repetitions'),
    setsRepetitions: t('programs.access.prescription.setsRepetitions'),
    sets: t('programs.access.prescription.sets'),
    time: t('programs.access.prescription.time'),
    distance: t('programs.access.prescription.distance'),
    steps: t('programs.access.prescription.steps'),
    effort: t('programs.access.prescription.effort'),
    perLeg: t('programs.access.prescription.perLeg'),
    perSide: t('programs.access.prescription.perSide'),
  }
  const workoutGroups = content.workouts.reduce<
    Array<{ group: (typeof content.workouts)[number]['group']; workouts: typeof content.workouts }>
  >((groups, workout) => {
    const existing = groups.find((entry) => entry.group === workout.group)
    if (existing) existing.workouts.push(workout)
    else groups.push({ group: workout.group, workouts: [workout] })
    return groups
  }, [])

  return (
    <div className="program-portal-shell pb-20">
      <SiteContainer variant="app" className="pt-5 sm:pt-8">
        <section className="program-portal-hero relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/20 shadow-moove-soft sm:min-h-[32rem]">
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: heroPosition }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-moove-ink via-moove-espresso/65 to-moove-espresso/10" />
          <div className="relative flex min-h-[28rem] flex-col justify-between p-6 sm:min-h-[32rem] sm:p-10 lg:p-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                <LockIcon />
                {t('programs.access.privateAccess')}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-moove-lime backdrop-blur-md">
                {content.sections.length} {t('programs.access.sections')}
              </span>
            </div>

            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-moove-lime">
                {t('programs.access.eyebrow')}
              </p>
              <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                {content.title}
              </h1>
              <p className="font-display mt-3 text-xl font-semibold text-moove-lime sm:text-2xl">
                {content.workoutTitle}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {content.meta?.duration ? (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                    {content.meta.duration}
                  </span>
                ) : null}
                {levelLabel ? (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                    {levelLabel}
                  </span>
                ) : null}
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-white/65">
                <LockIcon />
                {t('programs.access.privateNote')}
              </p>
              <button
                type="button"
                onClick={() => navigateToSection(0)}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-moove-lime px-5 py-3 text-sm font-bold text-moove-ink shadow-moove-glow transition hover:bg-moove-lime-hover active:scale-[0.98]"
              >
                {t('programs.access.startProgram')}
                <span aria-hidden>↓</span>
              </button>
            </div>
          </div>
        </section>

        {content.workouts.length > 1 ? (
          <section className="mt-6 rounded-[1.5rem] border border-moove-border/80 bg-moove-surface p-5 shadow-moove-lift sm:p-7">
            <p className="moove-eyebrow">{t('programs.access.includedWorkouts')}</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-moove-silver">
              {t('programs.access.chooseWorkout')}
            </h2>
            <div className="mt-5 space-y-5">
              {workoutGroups.map((group) => (
                <div key={group.group}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-moove-muted">
                    {t(`programs.access.groups.${group.group}`)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.workouts.map((workout, index) => (
                      <button
                        key={workout.key}
                        type="button"
                        onClick={() => setSearchParams({ workout: workout.key })}
                        className={`rounded-full border px-4 py-2.5 text-left text-xs font-semibold transition ${
                          content.activeWorkoutKey === workout.key
                            ? 'border-moove-espresso bg-moove-espresso text-moove-lime'
                            : 'border-moove-border/80 bg-moove-bg text-moove-silver hover:border-moove-lime-deep/50'
                        }`}
                        aria-current={content.activeWorkoutKey === workout.key ? 'page' : undefined}
                      >
                        {String(index + 1).padStart(2, '0')} · {workout.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {content.meta ? (
          <section className="mt-6" aria-labelledby="program-overview-title">
            <p className="moove-eyebrow">{t('programs.access.overview')}</p>
            <h2 id="program-overview-title" className="font-display mt-3 text-2xl font-semibold text-moove-silver sm:text-3xl">
              {t('programs.access.programPlan')}
            </h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <article className="rounded-[1.5rem] border border-moove-border/80 bg-moove-surface p-6 shadow-moove-lift sm:p-7">
                <span className="inline-flex rounded-full bg-moove-lime/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-moove-espresso">
                  {t('programs.access.metaGoal')}
                </span>
                <p className="mt-4 text-sm leading-7 text-moove-muted">{content.meta.goal}</p>
              </article>
              <article className="rounded-[1.5rem] border border-moove-border/80 bg-moove-espresso p-6 text-white shadow-moove-lift sm:p-7">
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-moove-lime">
                  {t('programs.access.metaProgress')}
                </span>
                <p className="mt-4 text-sm leading-7 text-white/75">{content.meta.progressNote}</p>
              </article>
            </div>
          </section>
        ) : null}

        {content.activeWorkoutKey.startsWith('peach_sculpt_') ? (
          <PeachSculptGuidelines variant="access" />
        ) : null}

        <section className="mt-10" aria-labelledby="program-workout-title">
          <p className="moove-eyebrow">{t('programs.access.workout')}</p>
          <h2 id="program-workout-title" className="font-display mt-3 text-3xl font-semibold text-moove-silver sm:text-4xl">
            {t('programs.access.todaysPlan')}
          </h2>
        </section>
      </SiteContainer>

      <nav className="sticky top-[4.4rem] z-30 mt-6 border-y border-moove-border/70 bg-moove-bg/90 py-3 backdrop-blur-xl" aria-label={t('programs.access.sectionNavigation')}>
        <SiteContainer variant="app" className="program-section-nav flex gap-2 overflow-x-auto">
          {content.sections.map((section, index) => (
            <button
              key={`${section.title}-${index}`}
              type="button"
              onClick={() => navigateToSection(index)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition ${
                activeSection === index
                  ? 'border-moove-espresso bg-moove-espresso text-moove-lime'
                  : 'border-moove-border/80 bg-moove-surface text-moove-muted hover:border-moove-lime-deep/50 hover:text-moove-espresso'
              }`}
              aria-current={activeSection === index ? 'location' : undefined}
            >
              <span className="mr-2 text-moove-accent">{String(index + 1).padStart(2, '0')}</span>
              {section.title}
            </button>
          ))}
        </SiteContainer>
      </nav>

      <SiteContainer variant="app" className="mt-6 space-y-4">
        {content.sections.map((section, sectionIndex) => {
          const isOpen = expandedSections.has(sectionIndex)
          const panelId = `program-section-panel-${sectionIndex}`

          return (
            <section
              id={`program-section-${sectionIndex}`}
              key={`${section.title}-${sectionIndex}`}
              className="scroll-mt-36 overflow-hidden rounded-[1.5rem] border border-moove-border/80 bg-moove-surface shadow-moove-lift"
            >
              <button
                type="button"
                onClick={() => toggleSection(sectionIndex)}
                className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-moove-espresso/[0.025] sm:p-7"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={`${isOpen ? t('programs.access.closeSection') : t('programs.access.openSection')}: ${section.title}`}
              >
                <span className="font-display text-xl text-moove-accent/65">
                  {String(sectionIndex + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display block text-xl font-semibold text-moove-silver sm:text-2xl">
                    {section.title}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-moove-muted">
                    {section.exercises.length} {t('programs.access.exercises')}
                  </span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moove-espresso text-moove-lime">
                  <ChevronIcon open={isOpen} />
                </span>
              </button>

              <div id={panelId} hidden={!isOpen}>
                <div className="border-t border-moove-border/70 p-4 sm:p-6">
                  <div className="grid gap-3 lg:grid-cols-2">
                    {section.exercises.map((exercise, exerciseIndex) => {
                      if (!exercise.sets) {
                        return (
                          <article
                            key={`${section.title}-${exercise.name}-${exerciseIndex}`}
                            className="rounded-2xl border border-moove-lime-deep/20 bg-moove-lime/[0.07] p-5 sm:p-6"
                          >
                            <div className="flex items-start gap-4">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-moove-lime/30 text-sm font-bold text-moove-espresso">
                                i
                              </span>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-moove-accent">
                                  {t('programs.access.instruction')}
                                </p>
                                <h3 className="font-display mt-1 text-lg font-semibold leading-snug text-moove-silver">
                                  {exercise.name}
                                </h3>
                                {exercise.notes ? (
                                  <p className="mt-2 text-sm leading-7 text-moove-muted">{exercise.notes}</p>
                                ) : null}
                              </div>
                            </div>
                            {exercise.videoId ? (
                              <div className="mt-5">
                                <VideoEmbed videoId={exercise.videoId} title={exercise.name} />
                              </div>
                            ) : null}
                          </article>
                        )
                      }

                      const prescription = formatProgramPrescription(
                        exercise.sets,
                        locale,
                        prescriptionLabels,
                      )

                      return (
                        <article
                          key={`${section.title}-${exercise.name}-${exerciseIndex}`}
                          className="rounded-2xl border border-moove-border/70 bg-moove-bg/45 p-5 transition hover:border-moove-border hover:bg-moove-surface sm:p-6"
                        >
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 text-center">
                              <span className="font-display block text-sm text-moove-accent/60">
                                {String(exerciseIndex + 1).padStart(2, '0')}
                              </span>
                              <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.12em] text-moove-muted/55">
                                {t('programs.access.exercise')}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <h3 className="font-display text-lg font-semibold leading-snug text-moove-silver">
                                  {exercise.name}
                                </h3>
                                <div className="w-fit min-w-28 shrink-0 rounded-xl border border-moove-lime-deep/15 bg-moove-lime/20 px-3 py-2 sm:text-right">
                                  <span className="block text-[9px] font-bold uppercase tracking-[0.14em] text-moove-espresso/65">
                                    {prescription.label}
                                  </span>
                                  <span className="mt-0.5 block text-sm font-bold text-moove-espresso">
                                    {prescription.value}
                                  </span>
                                  {prescription.detail ? (
                                    <span className="mt-1 block max-w-44 text-[10px] leading-relaxed text-moove-muted">
                                      {prescription.detail}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              {exercise.notes ? (
                                <p className="mt-4 border-t border-moove-border/60 pt-3 text-sm leading-7 text-moove-muted">
                                  {exercise.notes}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          {exercise.videoId ? (
                            <div className="mt-5">
                              <VideoEmbed videoId={exercise.videoId} title={exercise.name} />
                            </div>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </SiteContainer>
    </div>
  )
}
