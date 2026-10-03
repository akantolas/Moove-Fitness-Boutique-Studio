import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  computePosingBonusSessions,
  computeSeptemberBonusSessions,
  getOctoberBonusSessions,
  getSeptemberBonusSessions,
  isOctoberOfferActive,
  isSeptemberLoyaltyPeriodActive,
  isSeptemberOfferActive,
  OCTOBER_BONUS_PLAN_KEYS,
  OCTOBER_BONUS_SESSIONS,
  SEPTEMBER_BONUS_PLAN_KEYS,
  shouldShowOffersPopup,
} from '../api/posing/_offers.js'

const SEPT_MID = new Date('2026-09-15T12:00:00+03:00')
const AUG_END = new Date('2026-08-31T23:59:59+03:00')
const OCT_START = new Date('2026-10-01T00:00:00+03:00')
const OCT_MID = new Date('2026-10-15T12:00:00+03:00')
const NOV_START = new Date('2026-11-01T00:00:00+03:00')
const JAN_2027 = new Date('2027-01-15T12:00:00+03:00')
const MAR_31_2027 = new Date('2027-03-31T23:59:59+03:00')
const APR_1_2027 = new Date('2027-04-01T00:00:00+03:00')

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

describe('isSeptemberLoyaltyPeriodActive', () => {
  it('is active through 31 March 2027', () => {
    assert.equal(isSeptemberLoyaltyPeriodActive(SEPT_MID), true)
    assert.equal(isSeptemberLoyaltyPeriodActive(JAN_2027), true)
    assert.equal(isSeptemberLoyaltyPeriodActive(MAR_31_2027), true)
  })

  it('is inactive from 1 April 2027', () => {
    assert.equal(isSeptemberLoyaltyPeriodActive(APR_1_2027), false)
  })
})

describe('getSeptemberBonusSessions', () => {
  it('returns 1 for sapphire, ruby, diamond during the offer', () => {
    for (const planKey of SEPTEMBER_BONUS_PLAN_KEYS) {
      assert.equal(getSeptemberBonusSessions(planKey, SEPT_MID), 1)
    }
  })

  it('returns 0 for single and outside the enrollment window', () => {
    assert.equal(getSeptemberBonusSessions('single', SEPT_MID), 0)
    assert.equal(getSeptemberBonusSessions('ruby', AUG_END), 0)
    assert.equal(getSeptemberBonusSessions('ruby', OCT_START), 0)
  })
})

describe('computeSeptemberBonusSessions', () => {
  it('returns 1 during September for eligible plans', () => {
    assert.equal(
      computeSeptemberBonusSessions('ruby', { enrolledInSeptemberOffer: false }, SEPT_MID),
      1,
    )
  })

  it('returns 1 after September for enrolled users within loyalty period', () => {
    assert.equal(
      computeSeptemberBonusSessions('diamond', { enrolledInSeptemberOffer: true }, JAN_2027),
      1,
    )
  })

  it('returns 0 after September for users not enrolled in September', () => {
    assert.equal(
      computeSeptemberBonusSessions('ruby', { enrolledInSeptemberOffer: false }, JAN_2027),
      0,
    )
  })

  it('returns 0 after loyalty period even if enrolled', () => {
    assert.equal(
      computeSeptemberBonusSessions('ruby', { enrolledInSeptemberOffer: true }, APR_1_2027),
      0,
    )
  })

  it('returns 0 for single plan', () => {
    assert.equal(
      computeSeptemberBonusSessions('single', { enrolledInSeptemberOffer: true }, JAN_2027),
      0,
    )
  })
})

describe('getOctoberBonusSessions', () => {
  it('returns 2 for sapphire, ruby, diamond during October', () => {
    for (const planKey of OCTOBER_BONUS_PLAN_KEYS) {
      assert.equal(getOctoberBonusSessions(planKey, OCT_MID), OCTOBER_BONUS_SESSIONS)
    }
  })

  it('returns 0 for single and outside October', () => {
    assert.equal(getOctoberBonusSessions('single', OCT_MID), 0)
    assert.equal(getOctoberBonusSessions('ruby', SEPT_MID), 0)
    assert.equal(getOctoberBonusSessions('diamond', NOV_START), 0)
  })
})

describe('isOctoberOfferActive', () => {
  it('is active during October 2026 (Athens)', () => {
    assert.equal(isOctoberOfferActive(OCT_START), true)
    assert.equal(isOctoberOfferActive(OCT_MID), true)
    assert.equal(isOctoberOfferActive(new Date('2026-10-31T23:59:59+03:00')), true)
  })

  it('is inactive before October and from November', () => {
    assert.equal(isOctoberOfferActive(SEPT_MID), false)
    assert.equal(isOctoberOfferActive(NOV_START), false)
  })
})

describe('computePosingBonusSessions', () => {
  it('returns 2 during October even for September loyalty members', () => {
    assert.equal(
      computePosingBonusSessions('ruby', { enrolledInSeptemberOffer: true }, OCT_MID),
      2,
    )
    assert.equal(
      computePosingBonusSessions('diamond', { enrolledInSeptemberOffer: false }, OCT_MID),
      2,
    )
  })

  it('falls back to September loyalty after October', () => {
    assert.equal(
      computePosingBonusSessions('ruby', { enrolledInSeptemberOffer: true }, JAN_2027),
      1,
    )
    assert.equal(
      computePosingBonusSessions('ruby', { enrolledInSeptemberOffer: false }, JAN_2027),
      0,
    )
  })
})

describe('shouldShowOffersPopup', () => {
  it('shows when the October offer is active and not seen this session', () => {
    assert.equal(shouldShowOffersPopup({ seenInSession: false }, OCT_MID), true)
  })

  it('hides when already seen this session', () => {
    assert.equal(shouldShowOffersPopup({ seenInSession: true }, OCT_MID), false)
  })

  it('hides when the October offer is inactive', () => {
    assert.equal(shouldShowOffersPopup({ seenInSession: false }, SEPT_MID), false)
    assert.equal(shouldShowOffersPopup({ seenInSession: false }, NOV_START), false)
  })
})
