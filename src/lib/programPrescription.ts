export type PrescriptionKind = 'reps' | 'sets-reps' | 'time' | 'distance' | 'steps' | 'effort'

export type PrescriptionLabels = {
  repetitions: string
  setsRepetitions: string
  sets: string
  time: string
  distance: string
  steps: string
  effort: string
  perLeg: string
  perSide: string
}

export type PrescriptionDisplay = {
  label: string
  value: string
  detail?: string
  kind: PrescriptionKind
}

function normalizeQualifiers(value: string, locale: string, labels: PrescriptionLabels) {
  let normalized = value
    .replace(/\s*ανά πόδι/gi, ` / ${labels.perLeg}`)
    .replace(/\s*ανά πλευρά/gi, ` / ${labels.perSide}`)
    .replace(/\s*κάθε πόδι/gi, ` / ${labels.perLeg}`)
    .replace(/\s*\/\s*(?:leg|p\/leg)/gi, ` / ${labels.perLeg}`)
    .replace(/\s*\/\s*side/gi, ` / ${labels.perSide}`)

  if (locale === 'en') {
    normalized = normalized
      .replace(/\s*επαναλήψεις/gi, '')
      .replace(/\s*βήματα/gi, '')
      .replace(/\s*μέτρα/gi, ' m')
      .replace(/\s*λεπτά/gi, ' min')
      .replace(/\s*δευτερόλεπτα/gi, ' sec')
  }

  return normalized.replace(/\s{2,}/g, ' ').trim()
}

function withoutExplicitRepetitionUnit(value: string) {
  return value.replace(/\s*επαναλήψεις/gi, '').replace(/\s*reps?/gi, '').trim()
}

export function formatProgramPrescription(
  rawValue: string,
  locale: string,
  labels: PrescriptionLabels,
): PrescriptionDisplay {
  const raw = rawValue.trim()
  const normalized = normalizeQualifiers(raw, locale, labels)

  if (/″|λεπτά|δευτερόλεπτα|\bmin\b|\bsec\b/i.test(raw)) {
    return { label: labels.time, value: normalized, kind: 'time' }
  }

  if (/μέτρα|\bmeters?\b|\bmetres?\b/i.test(raw)) {
    return { label: labels.distance, value: normalized, kind: 'distance' }
  }

  if (/βήματα|\bsteps?\b/i.test(raw)) {
    const stepsValue = normalized.replace(/\s*βήματα/gi, '').replace(/\s*steps?/gi, '').trim()
    const setsStepsMatch = stepsValue.match(/^(\d+)\s*[x×]\s*(.+)$/i)

    return {
      label: labels.steps,
      value: setsStepsMatch
        ? `${setsStepsMatch[1]} ${labels.sets.toLocaleLowerCase(locale === 'en' ? 'en' : 'el')} × ${setsStepsMatch[2]}`
        : stepsValue,
      kind: 'steps',
    }
  }

  const setsMatch = normalized.match(/^(\d+)\s*[x×]\s*(.+)$/i)
  if (setsMatch) {
    const [, sets, prescription] = setsMatch
    if (/αστοχία|failure/i.test(prescription)) {
      return {
        label: labels.sets,
        value: sets,
        detail:
          locale === 'en'
            ? prescription.replace(/σχεδόν τεχνική αστοχία/gi, 'close to technical failure')
            : prescription,
        kind: 'effort',
      }
    }

    return {
      label: labels.setsRepetitions,
      value: `${sets} × ${withoutExplicitRepetitionUnit(prescription)}`,
      kind: 'sets-reps',
    }
  }

  if (/^\d+(?:[–-]\d+)?(?:\s*\/\s*.+)?$/.test(withoutExplicitRepetitionUnit(normalized))) {
    return {
      label: labels.repetitions,
      value: withoutExplicitRepetitionUnit(normalized),
      kind: 'reps',
    }
  }

  if (/επαναλήψεις|\breps?\b/i.test(raw)) {
    return {
      label: labels.repetitions,
      value: withoutExplicitRepetitionUnit(normalized),
      kind: 'reps',
    }
  }

  return {
    label: labels.effort,
    value: normalized.replace(/\bx\b/gi, '×'),
    kind: 'effort',
  }
}
