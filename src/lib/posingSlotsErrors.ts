export function translateSlotsError(code: string, t: (key: string) => string) {
  const key = `posing.calendar.errors.${code}`
  const translated = t(key)
  return translated === key ? code : translated
}
