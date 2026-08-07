import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FONT_PATH = join(__dirname, 'assets', 'NotoSans-Regular.ttf')

const GOAL_LABELS = {
  el: { cut: 'Αδυνάτισμα', maintain: 'Διατήρηση', bulk: 'Μυϊκή μάζα' },
  en: { cut: 'Fat loss', maintain: 'Maintenance', bulk: 'Muscle gain' },
}

const MEAL_TYPE_LABELS = {
  el: { breakfast: 'Πρωινό', snack: 'Σνακ', lunch: 'Μεσημεριανό', dinner: 'Βραδινό' },
  en: { breakfast: 'Breakfast', snack: 'Snack', lunch: 'Lunch', dinner: 'Dinner' },
}

const DISCLAIMER = {
  el: 'Αυτό το πλάνο δεν αποτελεί ιατρική ή διαιτολογική συμβουλή. Συμβουλέψου επαγγελματία υγείας για σοβαρές αλλεργίες ή παθήσεις.',
  en: 'This plan is not medical or dietary advice. Consult a healthcare professional for serious allergies or conditions.',
}

function t(locale, el, en) {
  return locale === 'en' ? en : el
}

function loadFont(doc) {
  try {
    const font = readFileSync(FONT_PATH)
    doc.registerFont('NotoSans', font)
    doc.font('NotoSans')
  } catch {
    doc.font('Helvetica')
  }
}

/**
 * @param {{
 *   locale: string,
 *   responses: Record<string, unknown>,
 *   calculated: Record<string, unknown>,
 *   mealPlan: { days: unknown[] },
 *   shoppingList: { item: string; times: number }[],
 * }} payload
 */
export function generateNutritionPdfBuffer(payload) {
  const { locale, responses, calculated, mealPlan, shoppingList } = payload
  const loc = locale === 'en' ? 'en' : 'el'
  const doc = new PDFDocument({ margin: 50, size: 'A4' })
  const chunks = []

  doc.on('data', (chunk) => chunks.push(chunk))

  const finished = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  loadFont(doc)

  const name = responses.name ? String(responses.name) : null
  const goalLabel = GOAL_LABELS[loc][responses.goal] ?? responses.goal

  doc.fontSize(22).text(t(loc, 'Moove — Διατροφικό Πλάνο', 'Moove — Nutrition Plan'), { align: 'center' })
  doc.moveDown(0.5)
  doc.fontSize(12).fillColor('#555555')
  if (name) {
    doc.text(`${t(loc, 'Όνομα', 'Name')}: ${name}`, { align: 'center' })
  }
  doc.text(new Date().toLocaleDateString(loc === 'el' ? 'el-GR' : 'en-GB'), { align: 'center' })
  doc.moveDown()
  doc.fillColor('#000000')

  doc.fontSize(14).text(t(loc, 'Στόχος', 'Goal'), { underline: true })
  doc.fontSize(11).text(goalLabel)
  doc.moveDown(0.5)

  doc.fontSize(14).text(t(loc, 'Θερμίδες & Macros', 'Calories & Macros'), { underline: true })
  doc.fontSize(11)
  doc.text(`TDEE: ${calculated.tdee} kcal`)
  doc.text(`${t(loc, 'Στόχος', 'Target')}: ${calculated.targetCalories} kcal`)
  const macros = calculated.macros
  doc.text(`P: ${macros.protein}g | C: ${macros.carbs}g | F: ${macros.fat}g`)
  doc.moveDown()

  doc.fontSize(14).text(t(loc, 'Εβδομαδιαίο Πλάνο', 'Weekly Plan'), { underline: true })
  doc.moveDown(0.3)

  for (const day of mealPlan.days ?? []) {
    doc.fontSize(12).fillColor('#333333').text(`${t(loc, 'Ημέρα', 'Day')} ${day.day}`)
    doc.fillColor('#000000').fontSize(10)

    for (const entry of day.meals ?? []) {
      const mealName = entry.meal?.name?.[loc] ?? entry.meal?.name?.el ?? entry.meal?.id
      const typeLabel = MEAL_TYPE_LABELS[loc][entry.mealType] ?? entry.mealType
      doc.text(`• ${typeLabel}: ${mealName} (${entry.meal?.calories ?? '—'} kcal)`)
      const ingredients = entry.meal?.ingredients?.[loc] ?? []
      if (ingredients.length) {
        doc.fillColor('#555555').text(`  ${ingredients.join(', ')}`)
        doc.fillColor('#000000')
      }
    }
    doc.moveDown(0.4)
  }

  doc.addPage()
  loadFont(doc)
  doc.fontSize(14).text(t(loc, 'Λίστα Αγορών', 'Shopping List'), { underline: true })
  doc.moveDown(0.3)
  doc.fontSize(10)
  for (const row of shoppingList ?? []) {
    const suffix = row.times > 1 ? ` (×${row.times})` : ''
    doc.text(`• ${row.item}${suffix}`)
  }

  doc.moveDown()
  doc.fontSize(8).fillColor('#888888').text(DISCLAIMER[loc], { align: 'left' })

  doc.end()
  return finished
}
