import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CATALOG_PRICES_EUR,
  getPayPalUrl,
  getRevolutUrl,
  resolvePlanPrice,
} from '../api/posing/_pricing.js'

describe('payment link amounts', () => {
  for (const [planKey, amountEur] of Object.entries(CATALOG_PRICES_EUR)) {
    it(`PayPal URL for ${planKey} uses whole EUR`, () => {
      const url = getPayPalUrl(amountEur)
      assert.ok(
        url.endsWith(`/${amountEur}EUR`),
        `expected /${amountEur}EUR, got ${url}`,
      )
    })

    it(`Revolut URL for ${planKey} uses the stable profile link`, () => {
      const url = getRevolutUrl(amountEur)
      assert.equal(url, 'https://revolut.me/magdaqsn9')
      assert.doesNotMatch(
        url,
        /\/eur\d+$/,
        'Revolut must not append an amount path',
      )
    })
  }

  it('returns base URL when amount is invalid', () => {
    assert.equal(getPayPalUrl(0), 'https://www.paypal.me/magdalinisamara')
    assert.equal(getRevolutUrl(0), 'https://revolut.me/magdaqsn9')
  })
  it('does not silently charge the catalog price when the custom-price lookup fails', async () => {
    const query = {
      select() {
        return this
      },
      eq() {
        return this
      },
      async maybeSingle() {
        return { data: null, error: { message: 'fixture' } }
      },
    }
    await assert.rejects(
      resolvePlanPrice({ from: () => query }, 'ruby', 'member'),
      /price_check_failed/,
    )
  })
})
