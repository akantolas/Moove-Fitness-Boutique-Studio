import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getSeptemberBonusSessions,
  isSeptemberOfferActive,
  SEPTEMBER_BONUS_PLAN_KEYS,
} from '../api/posing/_offers.js'

const SEPT_MID = new Date('2026-09-15T12:00:00+03:00')
const AUG_END = new Date('2026-08-31T23:59:59+03:00')
const OCT_START = new Date('2026-10-01T00:00:00+03:00')

describe('isSeptemberOfferActive', () => {
  it('is active during September 2026 (Athens)', () => {
    assert.equal(isSeptemberOfferActive(SEPT_MID), true)
    assert.equal(isSeptemberOfferActive(new Date('2026-09-01T00:00:00+03:00')), true)
    assert.equal(isSeptemberOfferActive(new Date('2026-09-30T23:59:59+03:00')), true)
  })

  it('is inactive before September and from October', () => {
    assert.equal(isSeptemberOfferActive(AUG_END), false)
    assert.equal(isSeptemberOfferActive(OCT_START), false)
  })
})

describe('getSeptemberBonusSessions', () => {
  it('returns 1 for sapphire, ruby, diamond during the offer', () => {
    for (const planKey of SEPTEMBER_BONUS_PLAN_KEYS) {
      assert.equal(getSeptemberBonusSessions(planKey, SEPT_MID), 1)
    }
  })

  it('returns 0 for single and outside the offer window', () => {
    assert.equal(getSeptemberBonusSessions('single', SEPT_MID), 0)
    assert.equal(getSeptemberBonusSessions('ruby', AUG_END), 0)
    assert.equal(getSeptemberBonusSessions('diamond', OCT_START), 0)
  })
})
