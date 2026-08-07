import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_NUTRITION_RESPONSES,
  type NutritionAllergy,
  type NutritionResponses,
} from '../lib/nutritionTypes'
import { useTranslation } from '../i18n/useTranslation'

const ALLERGIES: NutritionAllergy[] = ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish']

type NutritionQuestionnaireProps = {
  email?: string
  hideEmail?: boolean
  onComplete: (responses: NutritionResponses, email: string) => void
  submitLabel?: string
  busy?: boolean
}

const inputClass =
  'mt-1 w-full rounded-xl border border-moove-border/80 bg-white px-4 py-3 text-sm text-moove-silver outline-none ring-moove-lime/40 focus:ring-2'

export function NutritionQuestionnaire({
  email: emailProp = '',
  hideEmail = false,
  onComplete,
  submitLabel,
  busy = false,
}: NutritionQuestionnaireProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState(emailProp)
  const [data, setData] = useState<NutritionResponses>({ ...DEFAULT_NUTRITION_RESPONSES })
  const [error, setError] = useState('')

  const steps = [
    t('nutrition.questionnaire.steps.body'),
    t('nutrition.questionnaire.steps.activity'),
    t('nutrition.questionnaire.steps.preferences'),
    t('nutrition.questionnaire.steps.restrictions'),
  ]

  function update<K extends keyof NutritionResponses>(key: K, value: NutritionResponses[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function toggleAllergy(allergy: NutritionAllergy) {
    setData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }))
  }

  function validateStep(): boolean {
    setError('')
    if (step === 0) {
      if (data.age < 16 || data.age > 80) {
        setError(t('nutrition.questionnaire.errors.invalid_age'))
        return false
      }
      if (data.heightCm < 140 || data.heightCm > 220) {
        setError(t('nutrition.questionnaire.errors.invalid_height'))
        return false
      }
      if (data.weightKg < 40 || data.weightKg > 200) {
        setError(t('nutrition.questionnaire.errors.invalid_weight'))
        return false
      }
    }
    if (step === 3) {
      if (!hideEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError(t('nutrition.questionnaire.errors.invalid_email'))
        return false
      }
      if (!data.privacyConsent) {
        setError(t('nutrition.questionnaire.errors.privacy_required'))
        return false
      }
    }
    return true
  }

  function handleNext() {
    if (!validateStep()) return
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
      return
    }
    onComplete(
      { ...data, name: data.name?.trim() || null, dislikedFoods: data.dislikedFoods?.trim() || null },
      hideEmail ? emailProp.trim() : email.trim(),
    )
  }

  return (
    <div className="rounded-2xl border border-moove-border/80 bg-moove-espresso/[0.03] p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              index === step
                ? 'bg-moove-espresso text-moove-lime'
                : index < step
                  ? 'bg-moove-lime/20 text-moove-silver'
                  : 'bg-moove-border/30 text-moove-muted'
            }`}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      {step === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.age')}</span>
            <input
              type="number"
              min={16}
              max={80}
              value={data.age}
              onChange={(e) => update('age', Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.gender')}</span>
            <select
              value={data.gender}
              onChange={(e) => update('gender', e.target.value as NutritionResponses['gender'])}
              className={inputClass}
            >
              <option value="female">{t('nutrition.questionnaire.genderFemale')}</option>
              <option value="male">{t('nutrition.questionnaire.genderMale')}</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.height')}</span>
            <input
              type="number"
              min={140}
              max={220}
              value={data.heightCm}
              onChange={(e) => update('heightCm', Number(e.target.value))}
              className={inputClass}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.weight')}</span>
            <input
              type="number"
              min={40}
              max={200}
              value={data.weightKg}
              onChange={(e) => update('weightKg', Number(e.target.value))}
              className={inputClass}
            />
          </label>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-4">
          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.activity')}</span>
            <select
              value={data.activity}
              onChange={(e) => update('activity', e.target.value as NutritionResponses['activity'])}
              className={inputClass}
            >
              {(['sedentary', 'light', 'moderate', 'active', 'very_active'] as const).map((key) => (
                <option key={key} value={key}>
                  {t(`nutrition.questionnaire.activities.${key}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.goal')}</span>
            <select
              value={data.goal}
              onChange={(e) => update('goal', e.target.value as NutritionResponses['goal'])}
              className={inputClass}
            >
              {(['cut', 'maintain', 'bulk'] as const).map((key) => (
                <option key={key} value={key}>
                  {t(`nutrition.questionnaire.goals.${key}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4">
          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.dietType')}</span>
            <select
              value={data.dietType}
              onChange={(e) => update('dietType', e.target.value as NutritionResponses['dietType'])}
              className={inputClass}
            >
              {(['omnivore', 'vegetarian', 'vegan'] as const).map((key) => (
                <option key={key} value={key}>
                  {t(`nutrition.questionnaire.diets.${key}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.mealsPerDay')}</span>
            <select
              value={data.mealsPerDay}
              onChange={(e) => update('mealsPerDay', Number(e.target.value) as 3 | 4 | 5)}
              className={inputClass}
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.cookingLevel')}</span>
            <select
              value={data.cookingLevel}
              onChange={(e) => update('cookingLevel', e.target.value as NutritionResponses['cookingLevel'])}
              className={inputClass}
            >
              {(['minimal', 'moderate', 'advanced'] as const).map((key) => (
                <option key={key} value={key}>
                  {t(`nutrition.questionnaire.cooking.${key}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-4">
          <fieldset>
            <legend className="text-sm font-medium text-moove-silver">
              {t('nutrition.questionnaire.allergies')}
            </legend>
            <div className="mt-2 flex flex-wrap gap-3">
              {ALLERGIES.map((allergy) => (
                <label key={allergy} className="flex items-center gap-2 text-sm text-moove-muted">
                  <input
                    type="checkbox"
                    checked={data.allergies.includes(allergy)}
                    onChange={() => toggleAllergy(allergy)}
                    className="rounded border-moove-border text-moove-espresso focus:ring-moove-lime"
                  />
                  {t(`nutrition.questionnaire.allergyLabels.${allergy}`)}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.dislikedFoods')}</span>
            <input
              type="text"
              value={data.dislikedFoods ?? ''}
              onChange={(e) => update('dislikedFoods', e.target.value)}
              placeholder={t('nutrition.questionnaire.dislikedFoodsPlaceholder')}
              className={inputClass}
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.name')}</span>
            <input
              type="text"
              value={data.name ?? ''}
              onChange={(e) => update('name', e.target.value)}
              placeholder={t('nutrition.questionnaire.namePlaceholder')}
              className={inputClass}
            />
          </label>

          {!hideEmail ? (
            <label className="block text-sm">
              <span className="font-medium text-moove-silver">{t('nutrition.questionnaire.email')}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('nutrition.questionnaire.emailPlaceholder')}
                className={inputClass}
              />
            </label>
          ) : null}

          <p className="text-xs text-moove-muted">{t('nutrition.questionnaire.allergyWarning')}</p>

          <label className="flex items-start gap-3 text-sm text-moove-muted">
            <input
              type="checkbox"
              checked={data.privacyConsent}
              onChange={(e) => update('privacyConsent', e.target.checked)}
              className="mt-1 rounded border-moove-border text-moove-espresso focus:ring-moove-lime"
            />
            <span>
              {t('nutrition.questionnaire.privacyPrefix')}{' '}
              <Link to="/privacy" className="text-moove-ink underline">
                {t('nutrition.questionnaire.privacyLink')}
              </Link>
              . {t('nutrition.questionnaire.disclaimer')}
            </span>
          </label>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={busy}
            className="rounded-full border border-moove-border px-5 py-2.5 text-sm font-medium text-moove-silver transition hover:bg-moove-border/20 disabled:opacity-60"
          >
            {t('nutrition.questionnaire.back')}
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleNext}
          disabled={busy}
          className="rounded-full bg-moove-espresso px-6 py-2.5 text-sm font-semibold text-moove-lime transition hover:brightness-110 disabled:opacity-60"
        >
          {step === steps.length - 1
            ? (submitLabel ?? t('nutrition.questionnaire.submit'))
            : t('nutrition.questionnaire.next')}
        </button>
      </div>
    </div>
  )
}
