import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildProgramAccessPayload } from '../api/programs/_handlers/access.js'

describe('program bundle access payload', () => {
  it('returns the complete manifest and requested workout', () => {
    const result = buildProgramAccessPayload('peach_complete', 'el', 'peach_sculpt_b')

    assert.equal(result.status, 200)
    assert.equal(result.payload?.workouts.length, 12)
    assert.equal(result.payload?.activeWorkoutKey, 'peach_sculpt_b')
    assert.equal(result.payload?.workouts[0].group, 'start')
    assert.equal(result.payload?.workouts[3].group, 'build')
    assert.equal(result.payload?.workouts[7].group, 'sculpt')
    assert.ok(result.payload?.sections.length)
  })

  it('rejects a workout that is outside the purchased bundle', () => {
    const result = buildProgramAccessPayload(
      'peach_start_bundle',
      'en',
      'peach_build_wb',
    )

    assert.equal(result.status, 403)
    assert.equal(result.error, 'workout_not_in_purchase')
  })

  it('keeps a legacy purchase as a single-workout portal', () => {
    const result = buildProgramAccessPayload('peach_build_wd', 'en')

    assert.equal(result.status, 200)
    assert.equal(result.payload?.workouts.length, 1)
    assert.equal(result.payload?.activeWorkoutKey, 'peach_build_wd')
  })
})
