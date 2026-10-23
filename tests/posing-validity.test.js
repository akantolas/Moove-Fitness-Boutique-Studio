import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
import {
  handleExpiryReminders,
  packagesToRemind,
} from '../api/posing/_handlers/expiryReminders.js'
import {
  buildConfirmationEmail,
  buildPackageExpiryReminderEmail,
  buildPaymentEmail,
} from '../lib/email/templates.js'

const source = readFileSync(
  new URL('../src/lib/posingValidity.ts', import.meta.url),
  'utf8',
)
const { packageValidityDays } = await import(
  'data:text/javascript;base64,' +
    Buffer.from(
      ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText,
    ).toString('base64')
)

const DAY = 86400000
const NOW = Date.parse('2026-10-23T07:00:00Z')

describe('package validity shown to members', () => {
  it('matches the database rule: a month for 4 sessions, a week per extra one', () => {
    assert.equal(packageValidityDays(1), 30)
    assert.equal(packageValidityDays(4), 30)
    assert.equal(packageValidityDays(6), 44)
    assert.equal(packageValidityDays(8, 60), 60)
  })

  it('payment email states how long the package lasts', () => {
    const email = buildPaymentEmail({
      attendeeName: 'Test',
      packageName: 'Ruby',
      sessionTime: '1 Nov 2026, 12:00',
      packageValidityDays: 44,
      locale: 'el',
    })
    assert.match(email.text, /Ισχύς πακέτου.*44 ημέρες από την πληρωμή/)
  })

  it('confirmation email states the package end date', () => {
    const email = buildConfirmationEmail({
      attendeeName: 'Test',
      packageName: 'Ruby',
      sessionTime: '1 Nov 2026, 12:00',
      packageValidUntil: '21 November 2026',
      locale: 'en',
    })
    assert.match(email.text, /Package valid until.*21 November 2026/)
  })
})

describe('expiry reminders', () => {
  const base = {
    id: 'p',
    status: 'active',
    sessions_total: 5,
    sessions_used: 2,
    period_end: new Date(NOW + 3 * DAY).toISOString(),
    expiry_reminder_for: null,
  }

  it('reminds a package expiring within 5 days that still has sessions', () => {
    assert.deepEqual(packagesToRemind([base], NOW).map((p) => p.id), ['p'])
  })

  it('skips used-up, far-off, already-expired and already-reminded packages', () => {
    const packages = [
      { ...base, id: 'used', sessions_used: 5 },
      { ...base, id: 'far', period_end: new Date(NOW + 10 * DAY).toISOString() },
      { ...base, id: 'ended', period_end: new Date(NOW - DAY).toISOString() },
      { ...base, id: 'done', expiry_reminder_for: base.period_end },
    ]
    assert.deepEqual(packagesToRemind(packages, NOW), [])
  })

  it('reminds again when the expiry moved after the last reminder', () => {
    const moved = {
      ...base,
      expiry_reminder_for: new Date(NOW - 4 * DAY).toISOString(),
    }
    assert.equal(packagesToRemind([moved], NOW).length, 1)
  })

  it('the reminder email tells how many sessions are left and until when', () => {
    const email = buildPackageExpiryReminderEmail({
      attendeeName: 'Test',
      packageName: 'Ruby',
      planKey: 'ruby',
      sessionsRemaining: 3,
      validUntil: '26 Οκτωβρίου 2026',
      locale: 'el',
    })
    assert.match(email.subject, /λήγει στις 26 Οκτωβρίου 2026/)
    assert.match(email.text, /Σου απομένουν 3 συνεδρίες/)
    assert.ok(email.html.includes('/posing?plan=ruby#booking'))
  })

  it('only the scheduler holding CRON_SECRET can trigger it', async () => {
    const call = async (headers) => {
      const res = {
        statusCode: 0,
        setHeader() {},
        end(body) {
          this.body = JSON.parse(body)
        },
      }
      await handleExpiryReminders({ method: 'GET', headers }, res)
      return res
    }
    const previous = process.env.CRON_SECRET
    try {
      delete process.env.CRON_SECRET
      assert.equal((await call({})).statusCode, 503)
      process.env.CRON_SECRET = 'secret'
      assert.equal((await call({})).statusCode, 401)
      assert.equal(
        (await call({ authorization: 'Bearer wrong' })).statusCode,
        401,
      )
    } finally {
      if (previous === undefined) delete process.env.CRON_SECRET
      else process.env.CRON_SECRET = previous
    }
  })
})
