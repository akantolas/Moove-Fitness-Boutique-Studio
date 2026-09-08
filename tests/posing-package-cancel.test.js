import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  isBookingCancellable,
  isPackageCancellable,
} from '../api/posing/_lib.js'

const futureSlot = '2099-01-15T10:00:00+02:00'
const pastSlot = '2020-01-15T10:00:00+02:00'
const now = new Date('2026-09-08T12:00:00+03:00')

describe('isBookingCancellable', () => {
  it('allows pending_payment bookings', () => {
    assert.equal(isBookingCancellable({ status: 'pending_payment', slotStartAt: pastSlot }, now), true)
  })

  it('allows confirmed bookings with a future slot', () => {
    assert.equal(isBookingCancellable({ status: 'confirmed', slotStartAt: futureSlot }, now), true)
  })

  it('blocks confirmed bookings in the past', () => {
    assert.equal(isBookingCancellable({ status: 'confirmed', slotStartAt: pastSlot }, now), false)
  })

  it('blocks cancelled and completed bookings', () => {
    assert.equal(isBookingCancellable({ status: 'cancelled', slotStartAt: futureSlot }, now), false)
    assert.equal(isBookingCancellable({ status: 'completed', slotStartAt: futureSlot }, now), false)
  })
})

describe('isPackageCancellable', () => {
  it('allows pending_payment and active packages', () => {
    assert.equal(isPackageCancellable('pending_payment'), true)
    assert.equal(isPackageCancellable('active'), true)
  })

  it('blocks cancelled and expired packages', () => {
    assert.equal(isPackageCancellable('cancelled'), false)
    assert.equal(isPackageCancellable('expired'), false)
  })
})
