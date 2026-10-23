import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { describe, it } from 'node:test'
import { verifyStripeSignature } from '../api/posing/stripe-webhook.js'

const SECRET = 'whsec_test'
const PAYLOAD = '{"type":"checkout.session.completed"}'
const NOW = 1_800_000_000

function sign(timestamp, secret = SECRET) {
  return createHmac('sha256', secret)
    .update(`${timestamp}.${PAYLOAD}`)
    .digest('hex')
}

describe('Stripe webhook signature', () => {
  it('accepts a fresh, correctly signed event', () => {
    const header = `t=${NOW},v1=${sign(NOW)}`
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, NOW + 10), true)
  })

  it('rejects a correctly signed event replayed after 5 minutes', () => {
    const header = `t=${NOW},v1=${sign(NOW)}`
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, NOW + 301), false)
  })

  it('accepts any of several v1 signatures while a secret is rolled', () => {
    const header = `t=${NOW},v1=${sign(NOW, 'whsec_old')},v1=${sign(NOW)}`
    assert.equal(verifyStripeSignature(PAYLOAD, header, SECRET, NOW), true)
  })

  it('rejects a tampered payload', () => {
    const header = `t=${NOW},v1=${sign(NOW)}`
    assert.equal(
      verifyStripeSignature(`${PAYLOAD} `, header, SECRET, NOW),
      false,
    )
  })
})
