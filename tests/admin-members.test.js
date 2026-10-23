import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  hasLiveMembership,
  latestBySessionTime,
} from '../api/posing/admin/_handlers/members.js'

const NOW = Date.parse('2026-10-23T12:00:00Z')

describe('member card recent bookings', () => {
  it('lists the latest sessions by session time, not by when they were booked', () => {
    const bookings = [
      { id: 'old-session-booked-late', created_at: '2026-10-20T10:00:00Z', slot: { start_at: '2026-09-01T10:00:00Z' } },
      { id: 'newest', created_at: '2026-10-01T10:00:00Z', slot: { start_at: '2026-10-30T10:00:00Z' } },
      { id: 'middle', created_at: '2026-09-20T10:00:00Z', slot: { start_at: '2026-10-09T10:00:00Z' } },
      { id: 'oldest', created_at: '2026-07-01T10:00:00Z', slot: { start_at: '2026-07-02T10:00:00Z' } },
    ]
    assert.deepEqual(
      latestBySessionTime(bookings, 3).map((b) => b.id),
      ['newest', 'middle', 'old-session-booked-late'],
    )
  })
})

describe('member deletion guard', () => {
  const future = { status: 'confirmed', slot: { start_at: '2026-10-30T10:00:00Z' } }
  const past = { status: 'confirmed', slot: { start_at: '2026-10-01T10:00:00Z' } }
  const credit = { status: 'active', period_end: '2026-11-10T00:00:00Z', sessions_total: 5, sessions_used: 2 }

  it('blocks deleting a member with an upcoming session', () => {
    assert.equal(hasLiveMembership([future], [], NOW), true)
  })
  it('blocks deleting a member with an unpaid booking', () => {
    assert.equal(hasLiveMembership([{ status: 'pending_payment', slot: null }], [], NOW), true)
  })
  it('blocks deleting a member who still has paid sessions', () => {
    assert.equal(hasLiveMembership([past], [credit], NOW), true)
  })
  it('allows deleting a member whose packages are used up or expired', () => {
    const usedUp = { ...credit, sessions_used: 5 }
    const expired = { ...credit, period_end: '2026-10-15T00:00:00Z' }
    assert.equal(hasLiveMembership([past], [usedUp, expired], NOW), false)
  })
})
