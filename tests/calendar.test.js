import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  bookingCalendarUid,
  buildBookingCalendarArtifacts,
  buildGoogleCalendarUrl,
  buildIcsEvent,
} from '../lib/email/calendar.js'

const BOOKING_ID = 'abc123-test-booking'
const START_AT = '2026-07-20T12:00:00.000Z'
const DURATION_MINUTES = 30

function formatGoogleUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function formatIcsLocalAthens(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Athens',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`
}

describe('buildIcsEvent', () => {
  it('includes stable UID and Europe/Athens timezone', () => {
    const ics = buildIcsEvent({
      bookingId: BOOKING_ID,
      startAt: START_AT,
      durationMinutes: DURATION_MINUTES,
      summary: 'Move & Pose — Test',
      description: 'Test description',
    })

    assert.ok(ics.includes(`UID:${bookingCalendarUid(BOOKING_ID)}`))
    assert.ok(ics.includes('DTSTART;TZID=Europe/Athens:'))
    assert.ok(ics.includes('DTEND;TZID=Europe/Athens:'))
    assert.ok(ics.includes('STATUS:CONFIRMED'))
    assert.ok(ics.includes('METHOD:PUBLISH'))
    assert.ok(ics.includes('LOCATION:Online (WhatsApp)'))
  })

  it('sets DTEND to start plus duration in Athens local time', () => {
    const start = new Date(START_AT)
    const end = new Date(start.getTime() + DURATION_MINUTES * 60 * 1000)
    const ics = buildIcsEvent({
      bookingId: BOOKING_ID,
      startAt: START_AT,
      durationMinutes: DURATION_MINUTES,
      summary: 'Move & Pose — Test',
      description: 'Test description',
    })

    const dtStart = formatIcsLocalAthens(start)
    const dtEnd = formatIcsLocalAthens(end)
    assert.ok(ics.includes(`DTSTART;TZID=Europe/Athens:${dtStart}`))
    assert.ok(ics.includes(`DTEND;TZID=Europe/Athens:${dtEnd}`))
  })

  it('uses METHOD:CANCEL and STATUS:CANCELLED for cancellations', () => {
    const ics = buildIcsEvent({
      bookingId: BOOKING_ID,
      startAt: START_AT,
      durationMinutes: DURATION_MINUTES,
      summary: 'Move & Pose — Test',
      description: 'Test description',
      status: 'cancelled',
      sequence: 1,
    })

    assert.ok(ics.includes('METHOD:CANCEL'))
    assert.ok(ics.includes('STATUS:CANCELLED'))
    assert.ok(ics.includes('SEQUENCE:1'))
  })
})

describe('buildGoogleCalendarUrl', () => {
  it('encodes UTC start and end dates for the slot', () => {
    const start = new Date(START_AT)
    const end = new Date(start.getTime() + DURATION_MINUTES * 60 * 1000)
    const url = buildGoogleCalendarUrl({
      startAt: START_AT,
      durationMinutes: DURATION_MINUTES,
      summary: 'Move & Pose — Test',
      description: 'Test description',
    })

    const expectedDates = `${formatGoogleUtc(start)}/${formatGoogleUtc(end)}`
    const params = new URL(url).searchParams
    assert.equal(params.get('dates'), expectedDates)
    assert.equal(params.get('action'), 'TEMPLATE')
    assert.equal(params.get('location'), 'Online (WhatsApp)')
  })
})

describe('buildBookingCalendarArtifacts', () => {
  it('returns ICS attachment metadata', () => {
    const artifacts = buildBookingCalendarArtifacts({
      bookingId: BOOKING_ID,
      startAt: START_AT,
      durationMinutes: DURATION_MINUTES,
      packageName: 'Ruby',
      attendeeName: 'Test User',
      locale: 'el',
    })

    assert.equal(artifacts.attachment.filename, 'move-pose-session.ics')
    assert.equal(artifacts.attachment.contentType, 'text/calendar')
    assert.ok(artifacts.ics.includes(bookingCalendarUid(BOOKING_ID)))
    assert.ok(artifacts.googleCalendarUrl?.startsWith('https://calendar.google.com/calendar/render?'))
  })

  it('omits Google Calendar URL for cancelled events', () => {
    const artifacts = buildBookingCalendarArtifacts({
      bookingId: BOOKING_ID,
      startAt: START_AT,
      durationMinutes: DURATION_MINUTES,
      packageName: 'Ruby',
      attendeeName: 'Test User',
      locale: 'en',
      status: 'cancelled',
    })

    assert.equal(artifacts.googleCalendarUrl, null)
    assert.ok(artifacts.ics.includes('METHOD:CANCEL'))
  })
})
