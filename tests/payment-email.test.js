import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLatePaymentCreditEmail,
  buildMooveProgramPaymentEmail,
  buildPaymentEmail,
} from '../lib/email/templates.js'

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

  it('preserves decimal pricing in Moove program payment instructions', () => {
    const email = buildMooveProgramPaymentEmail({
      programName: 'Peach Start',
      purchaseId: 'abcd1234-5678-90ab-cdef',
      amountEur: 34.9,
      revolutLink: REVOLUT_URL,
      locale: 'el',
    })

    assert.match(email.text, /34,90\s*€/)
    assert.match(email.text, /κωδικό παραγγελίας ABCD1234/)
    assert.ok(email.html.includes(REVOLUT_URL))
  })
})

describe('payment deadline', () => {
  for (const [locale, window, label] of [
    ['el', 'έχεις 3 ώρες|κρατημένη για 3 ώρες', 'Πληρωμή έως'],
    ['en', 'held for 3 hours', 'Pay by'],
  ]) {
    it(`tells ${locale} customers they have 3 hours and until when`, () => {
      const email = buildPaymentEmail({
        attendeeName: 'Test Customer',
        packageName: 'Single',
        sessionTime: '1 August 2026, 12:00',
        revolutLink: REVOLUT_URL,
        amountEur: 70,
        bookingId: 'abcd1234-5678-90ab-cdef',
        paymentDeadline: '1 August 2026, 09:00 (Greece time)',
        locale,
      })
      assert.match(email.text, new RegExp(window))
      assert.match(email.text, new RegExp(`${label}.*09:00`))
      assert.ok(email.html.includes('09:00 (Greece time)'))
    })
  }
})

describe('late payment credit email', () => {
  it('asks the member to book a new time for their plan', () => {
    const email = buildLatePaymentCreditEmail({
      attendeeName: 'Test Customer',
      packageName: 'Ruby',
      planKey: 'ruby',
      sessionsTotal: 6,
      validUntil: '22 November 2026',
      locale: 'en',
    })
    assert.match(email.text, /every session available/)
    assert.ok(email.html.includes('/posing?plan=ruby#booking'))
  })
})
