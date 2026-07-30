import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildPaymentEmail } from '../lib/email/templates.js'

const REVOLUT_URL = 'https://revolut.me/magdaqsn9'

function buildRevolutPaymentEmail(locale) {
  return buildPaymentEmail({
    attendeeName: 'Test Customer',
    packageName: 'Single',
    sessionTime: '1 August 2026, 12:00',
    revolutLink: REVOLUT_URL,
    amountEur: 70,
    bookingId: 'abcd1234-5678-90ab-cdef',
    durationMinutes: 45,
    locale,
  })
}

describe('Revolut payment email instructions', () => {
  it('tells Greek customers which amount and booking reference to enter', () => {
    const email = buildRevolutPaymentEmail('el')
    const instruction =
      'Για πληρωμή με Revolut, συμπλήρωσε ποσό 70€ και στο πεδίο «Σημείωση» γράψε τον κωδικό κράτησης ABCD1234.'

    assert.match(email.text, new RegExp(instruction))
    assert.ok(email.html.includes(instruction))
    assert.ok(email.html.includes(REVOLUT_URL))
    assert.doesNotMatch(email.html, /revolut\.me\/magdaqsn9\/eur\d+/)
  })

  it('tells English customers which amount and booking reference to enter', () => {
    const email = buildRevolutPaymentEmail('en')
    const instruction =
      'For Revolut, enter 70€ and add booking ref ABCD1234 in the Note field.'

    assert.match(email.text, new RegExp(instruction))
    assert.ok(email.html.includes(instruction))
    assert.ok(email.html.includes(REVOLUT_URL))
  })

  it('does not render incomplete values when amount and reference are unavailable', () => {
    const email = buildPaymentEmail({
      attendeeName: 'Test Customer',
      packageName: 'Single',
      sessionTime: '1 August 2026, 12:00',
      revolutLink: REVOLUT_URL,
      locale: 'en',
    })

    assert.doesNotMatch(email.text, /undefined|null/)
    assert.doesNotMatch(email.text, /For Revolut/)
  })
})
