import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { trackDelivery } from '../lib/email/delivery.js'

function fixture() {
  const row = { status: 'paid', delivery_status: 'unknown' }
  const supabase = {
    from() {
      return {
        update(patch) {
          return {
            async eq() {
              Object.assign(row, patch)
              return { error: null }
            },
          }
        },
      }
    },
  }
  return { row, supabase }
}
describe('delivery is independent of payment', () => {
  it('records a returned generation failure without reverting payment', async () => {
    const { row, supabase } = fixture()
    const result = await trackDelivery(
      supabase,
      'orders',
      'fixture',
      'sent_at',
      async () => ({ ok: false, error: 'generation_failed' }),
    )
    assert.equal(result.ok, false)
    assert.equal(row.status, 'paid')
    assert.equal(row.delivery_status, 'failed')
    assert.equal(row.delivery_error, 'generation_failed')
  })
  it('records thrown errors and permits a later successful resend', async () => {
    const { row, supabase } = fixture()
    await trackDelivery(supabase, 'orders', 'fixture', 'sent_at', async () => {
      throw new Error('temporary_failure')
    })
    assert.equal(row.delivery_status, 'failed')
    const result = await trackDelivery(
      supabase,
      'orders',
      'fixture',
      'sent_at',
      async () => ({ ok: true }),
    )
    assert.equal(result.ok, true)
    assert.equal(row.delivery_status, 'sent')
    assert.equal(row.delivery_error, null)
    assert.ok(row.sent_at)
  })
  it('does not send if delivery tracking is unavailable', async () => {
    let sent = false
    const supabase = {
      from() {
        return {
          update() {
            return {
              async eq() {
                return { error: { message: 'offline' } }
              },
            }
          },
        }
      },
    }
    await assert.rejects(
      trackDelivery(supabase, 'orders', 'fixture', 'sent_at', async () => {
        sent = true
      }),
      /delivery_record_failed/,
    )
    assert.equal(sent, false)
  })
})
