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
