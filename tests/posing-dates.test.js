import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(
  new URL('../src/lib/posingDates.ts', import.meta.url),
  'utf8',
)
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const dates = await import(
  'data:text/javascript;base64,' + Buffer.from(js).toString('base64')
)
describe('Athens calendar boundaries', () => {
  it('Monday starts in Athens even when UTC is still Sunday', () => {
    assert.equal(
      dates.startOfWeek(new Date('2026-10-11T22:30:00Z')).toISOString(),
      '2026-10-11T21:00:00.000Z',
    )
  })
  it('preserves calendar days across the autumn change: the week is 169 hours', () => {
    const monday = dates.startOfWeek(new Date('2026-10-23T12:00:00Z'))
    const next = dates.addDays(monday, 7)
    assert.equal(next.toISOString(), '2026-10-25T22:00:00.000Z')
    assert.equal((next - monday) / 3600000, 169)
  })
  it('preserves calendar days across the spring change: the week is 167 hours', () => {
    const monday = dates.startOfWeek(new Date('2026-03-27T12:00:00Z'))
    const next = dates.addDays(monday, 7)
    assert.equal(next.toISOString(), '2026-03-29T21:00:00.000Z')
    assert.equal((next - monday) / 3600000, 167)
  })
  it('rejects a nonexistent spring clock time rather than booking a different hour', () => {
    assert.throws(
      () => dates.buildSlotIso('2026-03-29', '03:30'),
      /invalid_time/,
    )
    assert.equal(dates.isPastCell('2026-03-29', '03:30'), true)
  })
})

describe('member booking calendar days', () => {
  it('shows a slot on the last Sunday of the two-week view', () => {
    const monday = dates.startOfWeek(new Date('2026-10-23T12:00:00Z'))
    const days = Array.from({ length: 14 }, (_, i) => dates.addDays(monday, i))
    const sundaySlot = { id: 'sun', start_at: '2026-11-01T10:00:00Z' }
    const mondaySlot = { id: 'mon', start_at: '2026-10-19T08:00:00Z' }
    const byDay = dates.groupSlotsByAthensDay(days, [sundaySlot, mondaySlot])
    assert.equal(dates.athensDateKey(days[13]), '2026-11-01')
    assert.deepEqual(byDay.get(dates.athensDateKey(days[13])), [sundaySlot])
    assert.deepEqual(byDay.get(dates.athensDateKey(days[0])), [mondaySlot])
  })
  it('files a late-evening slot under its Athens day, not its UTC day', () => {
    const monday = dates.startOfWeek(new Date('2026-10-23T12:00:00Z'))
    const days = Array.from({ length: 14 }, (_, i) => dates.addDays(monday, i))
    // 00:30 Athens on Saturday is still Friday in UTC.
    const slot = { id: 'late', start_at: '2026-10-23T21:30:00Z' }
    const byDay = dates.groupSlotsByAthensDay(days, [slot])
    assert.deepEqual(byDay.get('2026-10-24'), [slot])
    assert.deepEqual(byDay.get('2026-10-23'), [])
  })
})
