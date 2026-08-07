import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FONT_PATH = join(__dirname, 'assets', 'NotoSans-Regular.ttf')

const MARGIN = 24
const PAGE_OPTS = { size: 'A4', layout: 'landscape', margin: 0 }

const TABLE = {
  labelColWidth: 68,
  headerHeight: 28,
  minRowHeight: 52,
  cellPadding: 4,
  fontSize: 7,
  headerFontSize: 7.5,
  labelFontSize: 7.5,
}

const BEVERAGE_CELL = {
  el: [
    '1 φλιτζάνι 240ml θαβά πριν κοιμηθείς',
    'πράσινο τσάι, κουρκουμά, ηλιάσπορος',
    '(ή κρέμα βανίλια 1-2 κ.γ. σε βρασμένο νερό)',
    'με 1/3 κ.γ. βανίλια θεϊνής',
    '+ 1/3 κ.γ. ηλιάσπορου',
    '+ 1 κ.γ. ρυμφόλιο μελιού',
  ].join('\n'),
  en: [
    '1 cup (240ml) before bed',
    'green tea, turmeric, flaxseed',
    '(or vanilla cream 1-2 tsp in hot water)',
    'with 1/3 tsp vanilla essence',
    '+ 1/3 tsp flaxseed',
    '+ 1 tsp honey',
  ].join('\n'),
}

const TABLE_NOTES = {
  el: [
    '* Ακολουθείτε τις επιλογές κάθετα μόνο, ωστόσο με όποια σειρά θέλετε!!',
    '* Σημειώνουμε ποσότητες και συχνότητα γευμάτων όσο καλύτερα μπορούμε!!',
    '* Επεξηγήσεις: κ.σ. = κουταλιά της σούπας · κ.γ. = κουταλιά του γλυκού · 1 φλιτζ. = φλιτζάνι/κούπα (~240ml)',
  ],
  en: [
    '* Follow each column vertically only, in any order you prefer.',
    '* Adjust portion sizes and meal frequency to suit your routine.',
    '* Abbreviations: tbsp = tablespoon · tsp = teaspoon · 1 cup ≈ 240ml',
  ],
}

const GUIDELINES = {
  el: [
    'Καταναλώνουμε 2 κουταλιές της σούπας ελαιόλαδο την εκτός από 1 κουταλιά της σούπας τζατζίκι (πρ. δεκατιαλό ή απογευματινό, πριν ύπνο).',
    'Καταναλώνουμε γεύμα ~1 ώρα πριν ή μετά την προπόνησή μας γεύμα.',
    'Γενικά πρωτεΐνης: Προσέχουμε ετικέτες δημητριακών ολικής άλεσης — συνήθως να περιέχουν 1) τουλάχιστον 5 με 6 γραμμάρια φυτικών ινών ανά μερίδα, 2) λιγότερα από 6 γραμμάρια σακχάρων ανά μερίδα, 3) λιγότερα από 7 γραμμάρια λιπαρών ανά μερίδα, 4) όχι περισσότερα από 250 χιλιοκαλορίες ανά μερίδα.',
    'Επιλογή γιαουρτιού κατά προτίμηση γιαούρτι 2%, ψηλό σε πρωτεΐνη (πρ. super spoon της Φάρμ-Φάρμ, vitaline).',
    'Μπορείτε να καταναλώνετε ελεύθερα σε ποσότητα σαλάτα της αρεσκείας σας.',
    'Μην παραλείπετε γεύματα!!',
    'Μην προσθέτετε επιπλέον επιτραπέζιο αλάτι στο φαγητό σας. Αποφεύγετε τη δάραση.',
    'Επιδιώξτε κάποιες ώρες φυσικής δραστηριότητας/ άσκησης στην καθημερινότητά σας (πρ. ~ 1 ώρα άσκηση/εκέρα).',
    'Βουρτσίζετε τα δόντια σας έπειτα από κάθε γεύμα.',
  ],
  en: [
    'Use olive oil mindfully; limit added salt at the table.',
    'Eat a meal about 1 hour before or after training.',
    'Choose whole grains with adequate fiber and moderate sugar per serving.',
    'Prefer high-protein 2% yogurt when dairy is included.',
    'Salad portions can be adjusted freely.',
    'Do not skip meals.',
    'Stay active most days (~1 hour of exercise).',
    'Brush teeth after meals when possible.',
  ],
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

function pageWidth(doc) {
  return doc.page.width
}

function pageHeight(doc) {
  return doc.page.height
}

function contentWidth(doc) {
  return pageWidth(doc) - MARGIN * 2
}

function dayColWidth(doc) {
  return (contentWidth(doc) - TABLE.labelColWidth) / 7
}

function addLandscapePage(doc) {
  doc.addPage(PAGE_OPTS)
}

function dietitianLabel(loc) {
  const fromEnv = process.env.NUTRITION_DIETITIAN_NAME?.trim()
  if (fromEnv) return fromEnv
  return t(loc, 'Μαγδα Σαμαρά', 'Magda Samara')
}

function formatDate(loc) {
  return new Date().toLocaleDateString(loc === 'el' ? 'el-GR' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

function formatCellContent(entry, loc) {
  if (!entry?.meal) return '—'
  const meal = entry.meal
  const ingredients = meal.ingredients?.[loc] ?? meal.ingredients?.el ?? []
  const instructions = meal.instructions?.[loc] ?? meal.instructions?.el ?? ''

  let text = ''
  if (ingredients.length) {
    text = String(ingredients[0])
    for (let i = 1; i < ingredients.length; i += 1) {
      text += `\n+ ${ingredients[i]}`
    }
  }
  if (instructions) {
    text += text ? `\n\n${instructions}` : instructions
  }
  if (!text) {
    text = meal.name?.[loc] ?? meal.name?.el ?? '—'
  }
  return text
}

function indexDayMeals(day) {
  const snacks = []
  const map = {}

  for (const entry of day.meals ?? []) {
    if (entry.mealType === 'snack') {
      snacks.push(entry)
    } else {
      map[entry.mealType] = entry
    }
  }

  if (snacks[0]) map._snack_0 = snacks[0]
  if (snacks[1]) map._snack_1 = snacks[1]
  return map
}

function buildTableRows(mealsPerDay, loc) {
  const rows = [
    {
      key: 'breakfast',
      label: t(loc, 'ΠΡΩΙΝΟ', 'BREAKFAST'),
    },
  ]

  if (mealsPerDay >= 4) {
    rows.push({
      key: '_snack_0',
      label: t(
        loc,
        'ΔΕΚΑΣΙΑΝΟ\n(2 σνακ περ.\n11:00, 13:00)',
        'MORNING SNACK\n(~11:00, 13:00)',
      ),
    })
  }

  rows.push({
    key: 'lunch',
    label: t(loc, 'ΜΕΣΗΜΕΡΙ', 'LUNCH'),
  })

  if (mealsPerDay >= 5) {
    rows.push({
      key: '_snack_1',
      label: t(loc, 'ΑΠΟΓΕΥΜΑ', 'AFTERNOON SNACK'),
    })
  }

  rows.push({
    key: 'dinner',
    label: t(loc, 'ΒΡΑΔΙΝΟ', 'DINNER'),
  })

  rows.push({
    key: 'beverage',
    label: t(loc, 'ΡΟΦΗΜΑ', 'EVENING DRINK'),
    staticText: BEVERAGE_CELL[loc],
  })

  return rows
}

function measureTextHeight(doc, text, width, fontSize) {
  doc.fontSize(fontSize)
  return doc.heightOfString(text, { width, lineGap: 1 })
}

function drawCellBorder(doc, x, y, width, height) {
  doc.rect(x, y, width, height).strokeColor('#333333').lineWidth(0.5).stroke()
}

function drawTableHeader(doc, y, loc) {
  const x0 = MARGIN
  const dayW = dayColWidth(doc)
  let x = x0

  doc.fontSize(TABLE.headerFontSize).fillColor('#000000')

  drawCellBorder(doc, x, y, TABLE.labelColWidth, TABLE.headerHeight)
  doc.text(t(loc, 'ΓΕΥΜΑ', 'MEAL'), x + TABLE.cellPadding, y + 8, {
    width: TABLE.labelColWidth - TABLE.cellPadding * 2,
    align: 'center',
  })
  x += TABLE.labelColWidth

  for (let day = 1; day <= 7; day += 1) {
    drawCellBorder(doc, x, y, dayW, TABLE.headerHeight)
    doc.text(t(loc, `${day}η επιλογή`, `Option ${day}`), x + TABLE.cellPadding, y + 8, {
      width: dayW - TABLE.cellPadding * 2,
      align: 'center',
    })
    x += dayW
  }

  return y + TABLE.headerHeight
}

function drawTableRow(doc, y, row, days, loc) {
  const x0 = MARGIN
  const dayW = dayColWidth(doc)
  const innerLabelW = TABLE.labelColWidth - TABLE.cellPadding * 2
  const innerDayW = dayW - TABLE.cellPadding * 2

  const dayMaps = days.map((day) => indexDayMeals(day))
  const cellTexts = []

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    if (row.staticText) {
      cellTexts.push(row.staticText)
      continue
    }
    const entry = dayMaps[dayIndex]?.[row.key]
    cellTexts.push(formatCellContent(entry, loc))
  }

  doc.fontSize(TABLE.fontSize)
  let rowHeight = TABLE.minRowHeight
  rowHeight = Math.max(
    rowHeight,
    measureTextHeight(doc, row.label, innerLabelW, TABLE.labelFontSize) + TABLE.cellPadding * 2,
  )
  for (const text of cellTexts) {
    rowHeight = Math.max(
      rowHeight,
      measureTextHeight(doc, text, innerDayW, TABLE.fontSize) + TABLE.cellPadding * 2,
    )
  }

  let x = x0

  drawCellBorder(doc, x, y, TABLE.labelColWidth, rowHeight)
  doc.fontSize(TABLE.labelFontSize).fillColor('#000000')
  doc.text(row.label, x + TABLE.cellPadding, y + TABLE.cellPadding, {
    width: innerLabelW,
    lineGap: 1,
  })
  x += TABLE.labelColWidth

  for (const text of cellTexts) {
    drawCellBorder(doc, x, y, dayW, rowHeight)
    doc.fontSize(TABLE.fontSize).fillColor('#111111')
    doc.text(text, x + TABLE.cellPadding, y + TABLE.cellPadding, {
      width: innerDayW,
      lineGap: 1,
    })
    x += dayW
  }

  return y + rowHeight
}

function ensureSpace(doc, y, needed, loc) {
  const bottom = pageHeight(doc) - MARGIN
  if (y + needed <= bottom) return y

  addLandscapePage(doc)
  loadFont(doc)
  return drawTableHeader(doc, MARGIN, loc)
}

function drawTitleBlock(doc, loc, name, targetCalories) {
  const title = t(loc, 'ΕΒΔΟΜΑΔΙΑΙΟ ΔΙΑΙΤΟΛΟΓΙΟ', 'WEEKLY MEAL PLAN')
  doc.fontSize(14).fillColor('#000000').text(title, MARGIN, MARGIN, {
    width: contentWidth(doc),
    align: 'center',
  })

  let subtitle = name ? `${name} · ` : ''
  subtitle += `${t(loc, 'Ημ/νία', 'Date')}: ${formatDate(loc)}`
  if (targetCalories) {
    subtitle += ` · ${targetCalories} kcal/${t(loc, 'ημέρα', 'day')}`
  }

  doc.fontSize(9).fillColor('#444444').text(subtitle, MARGIN, doc.y + 4, {
    width: contentWidth(doc),
    align: 'center',
  })

  return doc.y + 14
}

function drawTableNotes(doc, y, loc) {
  doc.fontSize(7).fillColor('#333333')
  for (const line of TABLE_NOTES[loc]) {
    doc.text(line, MARGIN, y, { width: contentWidth(doc), lineGap: 1 })
    y = doc.y + 2
  }
  return y + 6
}

function drawGuidelinesPage(doc, loc, shoppingList) {
  addLandscapePage(doc)
  loadFont(doc)

  doc
    .fontSize(12)
    .fillColor('#000000')
    .text(t(loc, 'ΟΔΗΓΙΕΣ & ΥΠΗΣΙΜΕΣ ΣΥΜΒΟΥΛΕΣ', 'GUIDELINES & TIPS'), MARGIN, MARGIN, {
      width: contentWidth(doc),
      align: 'left',
    })

  doc.moveDown(0.4)
  doc.fontSize(7.5).fillColor('#111111')

  for (const line of GUIDELINES[loc]) {
    doc.text(`* ${line}`, { width: contentWidth(doc), lineGap: 1 })
    doc.moveDown(0.2)
  }

  if (shoppingList?.length) {
    doc.moveDown(0.5)
    doc.fontSize(10).fillColor('#000000').text(t(loc, 'Λίστα Αγορών', 'Shopping List'), {
      underline: true,
    })
    doc.moveDown(0.2)
    doc.fontSize(7.5)
    const columns = 3
    const colW = contentWidth(doc) / columns
    let col = 0
    let startY = doc.y

    for (const row of shoppingList) {
      const suffix = row.times > 1 ? ` (×${row.times})` : ''
      const x = MARGIN + col * colW
      doc.text(`• ${row.item}${suffix}`, x, startY, { width: colW - 8, lineGap: 0.5 })
      const itemHeight = doc.heightOfString(`• ${row.item}${suffix}`, { width: colW - 8 })
      col += 1
      if (col >= columns) {
        col = 0
        startY += itemHeight + 4
      }
    }
  }

  doc.fontSize(10).fillColor('#000000')
  const closing = t(loc, 'ΚΑΛΗ ΕΠΙΤΥΧΙΑ!!!', 'BEST OF LUCK!!!')
  const signature = t(loc, 'Η Διαιτολόγος', 'Your dietitian')
  doc.text(`${closing} ${signature}: ${dietitianLabel(loc)}`, MARGIN, pageHeight(doc) - MARGIN - 18, {
    width: contentWidth(doc),
    align: 'center',
  })

  doc.fontSize(7).fillColor('#666666')
  doc.text(
    t(
      loc,
      'Αυτό το πλάνο δεν αποτελεί ιατρική συμβουλή. Συμβουλέψου επαγγελματία για σοβαρές αλλεργίες ή παθήσεις.',
      'This plan is not medical advice. Consult a professional for serious allergies or conditions.',
    ),
    MARGIN,
    pageHeight(doc) - MARGIN,
    { width: contentWidth(doc), align: 'center' },
  )
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
  const doc = new PDFDocument({
    ...PAGE_OPTS,
    autoFirstPage: false,
  })
  const chunks = []

  doc.on('data', (chunk) => chunks.push(chunk))

  const finished = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  addLandscapePage(doc)
  loadFont(doc)

  const name = responses.name ? String(responses.name) : null
  const mealsPerDay = Number(responses.mealsPerDay ?? responses.meals_per_day ?? 4)
  const rows = buildTableRows(mealsPerDay, loc)
  const days = mealPlan.days ?? []

  let y = drawTitleBlock(doc, loc, name, calculated.targetCalories)
  y = drawTableHeader(doc, y, loc)

  for (const row of rows) {
    doc.fontSize(TABLE.fontSize)
    const previewTexts = row.staticText
      ? Array(7).fill(row.staticText)
      : days.map((day, index) => formatCellContent(indexDayMeals(day)[row.key], loc))

    let estimatedHeight = TABLE.minRowHeight
    for (const text of previewTexts) {
      estimatedHeight = Math.max(
        estimatedHeight,
        measureTextHeight(doc, text, dayColWidth(doc) - TABLE.cellPadding * 2, TABLE.fontSize) +
          TABLE.cellPadding * 2,
      )
    }
    estimatedHeight = Math.max(
      estimatedHeight,
      measureTextHeight(doc, row.label, TABLE.labelColWidth - TABLE.cellPadding * 2, TABLE.labelFontSize) +
        TABLE.cellPadding * 2,
    )

    y = ensureSpace(doc, y, estimatedHeight + 4, loc)
    y = drawTableRow(doc, y, row, days, loc)
  }

  y = ensureSpace(doc, y, 48, loc)
  drawTableNotes(doc, y, loc)

  drawGuidelinesPage(doc, loc, shoppingList)

  doc.end()
  return finished
}
