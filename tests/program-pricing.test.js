import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getPayPalUrl, getRevolutUrl } from '../api/posing/_pricing.js'
import { CATALOG_PRICES_EUR, PROGRAM_KEYS } from '../api/programs/_pricing.js'

describe('moove program payment links', () => {
  for (const programKey of PROGRAM_KEYS) {
    const amountEur = CATALOG_PRICES_EUR[programKey]
    it(`PayPal URL for ${programKey} uses whole EUR`, () => {
      const url = getPayPalUrl(amountEur)
      assert.match(url, new RegExp(`/${amountEur}EUR$`))
    })
    it(`Revolut URL for ${programKey} uses the stable profile link`, () => {
      const url = getRevolutUrl(amountEur)
      assert.equal(url, 'https://revolut.me/magdaqsn9')
      assert.doesNotMatch(url, /\/eur\d+$/, 'Revolut must not append an amount path')
    })
  }
})
