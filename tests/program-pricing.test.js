import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getPayPalUrl, getRevolutUrl } from '../api/posing/_pricing.js'
import { createProgramStripeCheckout } from '../api/programs/_lib.js'
import {
  CATALOG_PRICES_CENTS,
  LEGACY_PROGRAM_KEYS,
  PROGRAM_KEYS,
  getCatalogPriceCents,
  getCatalogPriceEur,
  getIncludedWorkoutKeys,
  isValidProgramKey,
} from '../api/programs/_pricing.js'

describe('moove program payment links', () => {
  for (const programKey of PROGRAM_KEYS) {
    const amountCents = CATALOG_PRICES_CENTS[programKey]
    const amountEur = amountCents / 100

    it(`keeps exact cents for ${programKey}`, () => {
      assert.equal(getCatalogPriceCents(programKey), amountCents)
      assert.equal(getCatalogPriceEur(programKey), amountEur)
    })

    it(`PayPal URL for ${programKey} preserves decimals`, () => {
      const url = getPayPalUrl(amountEur)
      assert.match(url, new RegExp(`/${amountEur.toFixed(2)}EUR$`))
    })

    it(`Revolut URL for ${programKey} uses the stable generic link`, () => {
      const url = getRevolutUrl(amountEur)
      assert.equal(url, 'https://revolut.me/magdaqsn9')
    })
  }

  it('exposes only four products for new orders', () => {
    assert.deepEqual(PROGRAM_KEYS, [
      'peach_start_bundle',
      'peach_build',
      'peach_sculpt',
      'peach_complete',
    ])
    assert.equal(isValidProgramKey('peach_build'), true)
    assert.equal(isValidProgramKey('peach_build_wd'), false)
  })

  it('maps bundles to the expected workout counts', () => {
    assert.equal(getIncludedWorkoutKeys('peach_start_bundle').length, 3)
    assert.equal(getIncludedWorkoutKeys('peach_build').length, 4)
    assert.equal(getIncludedWorkoutKeys('peach_sculpt').length, 5)
    assert.equal(getIncludedWorkoutKeys('peach_complete').length, 12)
  })

  it('keeps every legacy purchase key accessible as one workout', () => {
    for (const legacyKey of LEGACY_PROGRAM_KEYS) {
      assert.deepEqual(getIncludedWorkoutKeys(legacyKey), [legacyKey])
    }
  })

  it('sends exact catalog cents to Stripe dynamic price_data', async () => {
    const previousSecret = process.env.STRIPE_SECRET_KEY
    const previousPrice = process.env.STRIPE_PRICE_PROGRAM_PEACH_START_BUNDLE
    const previousFetch = globalThis.fetch
    let checkoutParams

    process.env.STRIPE_SECRET_KEY = 'sk_test_example'
    delete process.env.STRIPE_PRICE_PROGRAM_PEACH_START_BUNDLE
    globalThis.fetch = async (_url, init) => {
      checkoutParams = new URLSearchParams(init?.body)
      return {
        ok: true,
        json: async () => ({ url: 'https://checkout.stripe.test', id: 'cs_test' }),
      }
    }

    try {
      await createProgramStripeCheckout({
        purchaseId: '00000000-0000-0000-0000-000000000000',
        programKey: 'peach_start_bundle',
        customerEmail: 'test@example.com',
        amountCents: 3490,
        programName: 'Peach Start',
      })
      assert.equal(checkoutParams?.get('line_items[0][price_data][unit_amount]'), '3490')
    } finally {
      globalThis.fetch = previousFetch
      if (previousSecret === undefined) delete process.env.STRIPE_SECRET_KEY
      else process.env.STRIPE_SECRET_KEY = previousSecret
      if (previousPrice === undefined) delete process.env.STRIPE_PRICE_PROGRAM_PEACH_START_BUNDLE
      else process.env.STRIPE_PRICE_PROGRAM_PEACH_START_BUNDLE = previousPrice
    }
  })
})
