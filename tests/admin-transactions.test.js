import assert from 'node:assert/strict'
import { before, beforeEach, after, describe, it } from 'node:test'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'

const ADMIN = '10000000-0000-4000-8000-000000000001'
const MEMBER = '10000000-0000-4000-8000-000000000002'
const OTHER = '10000000-0000-4000-8000-000000000003'
const MIGRATION = '20261013132600_admin_panel_reliability.sql'
let db

async function createDatabase() {
  const pg = await PGlite.create()
  await pg.exec(`
    create schema auth; create schema storage;
    create role anon; create role authenticated; create role service_role bypassrls;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  `)
  for (const name of [
    '001_posing_booking.sql',
    '002_profile_fields.sql',
    '005_booking_locale.sql',
    '005_posing_calendar_settings.sql',
    '006_weekday_calendar_templates.sql',
    '009_profile_plan_prices.sql',
    '010_moove_program_purchases.sql',
    '011_nutrition_plan_orders.sql',
    '011_moove_program_decimal_prices.sql',
  ]) {
    const sql = readFileSync(
      new URL(`../supabase/migrations/${name}`, import.meta.url),
      'utf8',
    ).replace(/create extension if not exists "pgcrypto";/g, '')
    await pg.exec(sql)
  }
  return pg
}

async function rpc(name, args) {
  const placeholders = args.map((_, i) => `$${i + 1}`).join(',')
  const { rows } = await db.query(
    `select public.${name}(${placeholders}) as result`,
    args,
  )
  return rows[0].result
}
async function seedPaid({
  total = 5,
  used = 0,
  date = '2026-09-15T09:00:00Z',
  status = 'active',
  plan = 'ruby',
} = {}) {
  const { rows } = await db.query(
    `insert into public.user_packages(user_id,plan_key,base_sessions,bonus_sessions,
    sessions_total,sessions_used,status,paid_at,period_start,period_end)
    values($1,$2,4,$3,$4,$5,$6,$7,now(),now()+interval '30 days') returning id`,
    [MEMBER, plan, total - 4, total, used, status, date],
  )
  return rows[0].id
}
async function slot(minutes = 30, days = 1) {
  const { rows } = await db.query(
    `insert into public.availability_slots(start_at,end_at)
    values(now()+make_interval(days=>$1),now()+make_interval(days=>$1,mins=>$2)) returning id`,
    [days, minutes],
  )
  return rows[0].id
}
async function booking(
  packageId,
  { status = 'confirmed', days = 1, plan = 'ruby' } = {},
) {
  const slotId = await slot(30, days)
  const { rows } = await db.query(
    `insert into public.posing_bookings(user_id,slot_id,plan_key,user_package_id,status,duration_minutes)
    values($1,$2,$3,$4,$5,30) returning id`,
    [MEMBER, slotId, plan, packageId, status],
  )
  return rows[0].id
}

describe('admin transactions in isolated Postgres', () => {
  before(async () => {
    db = await createDatabase()
    await db.exec(
      readFileSync(
        new URL(`../supabase/migrations/${MIGRATION}`, import.meta.url),
        'utf8',
      ),
    )
  })
  after(async () => {
    await db?.close()
  })
  beforeEach(async () => {
    await db.exec('truncate public.availability_slots, auth.users cascade')
    await db.query(
      `insert into auth.users(id,email) values($1,'admin@example.test'),($2,'member@example.test'),($3,'other@example.test')`,
      [ADMIN, MEMBER, OTHER],
    )
    await db.query("update public.profiles set role='admin' where id=$1", [
      ADMIN,
    ])
  })
  it('counts only paid September purchases and keeps loyalty through March', async () => {
    await seedPaid()
    assert.equal(
      await rpc('posing_bonus_sessions', [
        MEMBER,
        'ruby',
        '2026-10-13T09:00:00Z',
        null,
      ]),
      1,
    )
    assert.equal(
      await rpc('posing_bonus_sessions', [
        MEMBER,
        'diamond',
        '2027-03-31T20:59:59Z',
        null,
      ]),
      1,
    )
    assert.equal(
      await rpc('posing_bonus_sessions', [
        MEMBER,
        'ruby',
        '2027-03-31T21:00:00Z',
        null,
      ]),
      0,
    )
    await db.exec("update public.user_packages set status='cancelled'")
    assert.equal(
      await rpc('posing_bonus_sessions', [
        MEMBER,
        'ruby',
        '2026-10-13T09:00:00Z',
        null,
      ]),
      0,
    )
  })
  it('unpaid requests do not disqualify first-time buyers; October ends at Athens midnight after DST', async () => {
    await seedPaid({ status: 'pending_payment', date: null })
    assert.equal(
      await rpc('posing_bonus_sessions', [
        MEMBER,
        'ruby',
        '2026-10-31T21:59:59Z',
        null,
      ]),
      2,
    )
    assert.equal(
      await rpc('posing_bonus_sessions', [
        MEMBER,
        'ruby',
        '2026-10-31T22:00:00Z',
        null,
      ]),
      0,
    )
  })
  it('cancellation returns exactly one session, including on retries', async () => {
    const pkg = await seedPaid({ used: 1 })
    const b = await booking(pkg)
    assert.equal(
      (await rpc('posing_cancel_booking', [b, MEMBER, false])).already,
      false,
    )
    assert.equal(
      (await rpc('posing_cancel_booking', [b, MEMBER, false])).already,
      true,
    )
    assert.equal(
      (
        await db.query(
          'select sessions_used from public.user_packages where id=$1',
          [pkg],
        )
      ).rows[0].sessions_used,
      0,
    )
  })
  it('failed credit update rolls back cancellation', async () => {
    const pkg = await seedPaid({ used: 1 })
    const b = await booking(pkg)
    await db.exec(`create function public.fail_credit_update() returns trigger language plpgsql as $$ begin raise exception 'fixture_failure'; end $$;
      create trigger fixture_failure before update on public.user_packages for each row execute function public.fail_credit_update()`)
    await assert.rejects(
      rpc('posing_cancel_booking', [b, MEMBER, false]),
      /fixture_failure/,
    )
    assert.equal(
      (
        await db.query(
          'select status from public.posing_bookings where id=$1',
          [b],
        )
      ).rows[0].status,
      'confirmed',
    )
    await db.exec(
      'drop trigger fixture_failure on public.user_packages; drop function public.fail_credit_update()',
    )
  })
  it('payment and booking roll back together; retry does not reset credits', async () => {
    const pkg = await seedPaid({
      status: 'pending_payment',
      used: 0,
      date: null,
      total: 4,
    })
    const b = await booking(pkg, { status: 'pending_payment' })
    await db.exec(`create function public.fail_booking_update() returns trigger language plpgsql as $$ begin raise exception 'fixture_failure'; end $$;
      create trigger fixture_failure before update on public.posing_bookings for each row execute function public.fail_booking_update()`)
    await assert.rejects(
      rpc('posing_activate_payment', [
        b,
        pkg,
        'audit',
        'manual',
        ADMIN,
        '2026-09-20T09:00:00Z',
      ]),
      /fixture_failure/,
    )
    assert.equal(
      (
        await db.query('select status from public.user_packages where id=$1', [
          pkg,
        ])
      ).rows[0].status,
      'pending_payment',
    )
    await db.exec(
      'drop trigger fixture_failure on public.posing_bookings; drop function public.fail_booking_update()',
    )
    await rpc('posing_activate_payment', [
      b,
      pkg,
      'audit',
      'manual',
      ADMIN,
      '2026-09-20T09:00:00Z',
    ])
    const r = await rpc('posing_activate_payment', [
      b,
      pkg,
      'audit',
      'manual',
      ADMIN,
      '2026-10-01T09:00:00Z',
    ])
    assert.equal(r.already, true)
    const p = (
      await db.query(
        'select sessions_total,sessions_used from public.user_packages where id=$1',
        [pkg],
      )
    ).rows[0]
    assert.deepEqual(p, { sessions_total: 5, sessions_used: 1 })
  })
  it('admin adjustments require a reason, preserve committed bookings and are idempotent', async () => {
    const pkg = await seedPaid({ used: 5 })
    const request = '20000000-0000-4000-8000-000000000001'
    await assert.rejects(
      rpc('posing_adjust_sessions', [pkg, ADMIN, -1, 'Correction', request]),
      /no_available_sessions/,
    )
    await assert.rejects(
      rpc('posing_adjust_sessions', [pkg, MEMBER, 1, 'Correction', request]),
      /forbidden/,
    )
    await assert.rejects(
      rpc('posing_adjust_sessions', [pkg, ADMIN, 1, '', request]),
      /invalid_adjustment/,
    )
    await rpc('posing_adjust_sessions', [
      pkg,
      ADMIN,
      1,
      'Courtesy session',
      request,
    ])
    assert.equal(
      (
        await rpc('posing_adjust_sessions', [
          pkg,
          ADMIN,
          1,
          'Courtesy session',
          request,
        ])
      ).already,
      true,
    )
    assert.equal(
      (
        await db.query(
          'select sessions_total from public.user_packages where id=$1',
          [pkg],
        )
      ).rows[0].sessions_total,
      6,
    )
    assert.equal(
      (
        await db.query(
          'select count(*)::integer as n from public.posing_session_adjustments',
        )
      ).rows[0].n,
      1,
    )
  })
  it('archives a cancelled slot without deleting booking history', async () => {
    const pkg = await seedPaid()
    const b = await booking(pkg, { status: 'cancelled' })
    const slotId = (
      await db.query('select slot_id from public.posing_bookings where id=$1', [
        b,
      ])
    ).rows[0].slot_id
    await rpc('posing_edit_slots', [
      ADMIN,
      'archive',
      JSON.stringify([{ id: slotId }]),
    ])
    assert.equal(
      (
        await db.query(
          'select count(*)::integer as n from public.posing_bookings',
        )
      ).rows[0].n,
      1,
    )
    assert.ok(
      (
        await db.query(
          'select archived_at from public.availability_slots where id=$1',
          [slotId],
        )
      ).rows[0].archived_at,
    )
  })
  it('a failing batch rolls back all slot changes', async () => {
    const entries = [
      { start_at: '2099-01-01T09:00:00Z', end_at: '2099-01-01T09:30:00Z' },
      { start_at: '2099-01-01T09:15:00Z', end_at: '2099-01-01T09:45:00Z' },
    ]
    await assert.rejects(
      rpc('posing_edit_slots', [ADMIN, 'create', JSON.stringify(entries)]),
      /slot_overlap/,
    )
    assert.equal(
      (
        await db.query(
          'select count(*)::integer as n from public.availability_slots',
        )
      ).rows[0].n,
      0,
    )
  })
  it('Diamond occupies forty minutes and excludes overlapping alternatives', async () => {
    const pkg = await seedPaid({ plan: 'diamond' })
    const first = await slot()
    const r = await rpc('posing_reserve_booking', [
      MEMBER,
      first,
      'diamond',
      'el',
      100,
    ])
    assert.equal(r.booking.duration_minutes, 40)
    const next = (
      await db.query(
        `insert into public.availability_slots(start_at,end_at)
      select start_at+interval '30 minutes',end_at+interval '30 minutes' from public.availability_slots where id=$1 returning id`,
        [first],
      )
    ).rows[0].id
    await assert.rejects(
      rpc('posing_reserve_booking', [OTHER, next, 'ruby', 'el', 100]),
      /slot_taken/,
    )
    const available = await rpc('posing_available_slots', [
      new Date(),
      new Date(Date.now() + 3 * 86400000),
      'ruby',
    ])
    assert.equal(
      available.some((s) => s.id === next),
      false,
    )
    assert.equal(
      (
        await db.query(
          'select sessions_used from public.user_packages where id=$1',
          [pkg],
        )
      ).rows[0].sessions_used,
      1,
    )
  })
  it('completion does not debit another session and cannot complete a future booking', async () => {
    const pkg = await seedPaid({ used: 2 })
    const past = await booking(pkg, { days: -1 })
    const future = await booking(pkg, { days: 1 })
    await rpc('posing_complete_booking', [past, ADMIN])
    await rpc('posing_complete_booking', [past, ADMIN])
    await assert.rejects(
      rpc('posing_complete_booking', [future, ADMIN]),
      /session_not_finished/,
    )
    assert.equal(
      (
        await db.query(
          'select sessions_used from public.user_packages where id=$1',
          [pkg],
        )
      ).rows[0].sessions_used,
      2,
    )
  })
  it('stats exclude expired packages and booking lists paginate by session date', async () => {
    const pkg = await seedPaid()
    await booking(pkg, { days: 1 })
    await booking(pkg, { days: 2 })
    await db.query(
      "update public.user_packages set period_end=now()-interval '1 day' where id=$1",
      [pkg],
    )
    assert.equal((await rpc('posing_admin_stats', [])).activePackages, 0)
    const page = await rpc('posing_admin_bookings', [
      'non_cancelled',
      MEMBER,
      null,
      null,
      'member',
      1,
      1,
    ])
    assert.equal(page.total, 2)
    assert.equal(page.bookings.length, 1)
    const page2 = await rpc('posing_admin_bookings', [
      'non_cancelled',
      MEMBER,
      null,
      null,
      'member',
      2,
      1,
    ])
    assert.notEqual(page.bookings[0].id, page2.bookings[0].id)
  })
  it('browser roles cannot invoke billing mutations', async () => {
    const { rows } = await db.query(
      "select has_function_privilege('authenticated','public.posing_adjust_sessions(uuid,uuid,integer,text,uuid)','execute') as allowed",
    )
    assert.equal(rows[0].allowed, false)
  })
  it('supports package writes from the previous deployment during rollout', async () => {
    const pkg = (
      await db.query(
        `insert into public.user_packages(user_id,plan_key,sessions_total,status,period_end)
      values($1,'ruby',4,'pending_payment',now()+interval '30 days') returning id`,
        [MEMBER],
      )
    ).rows[0].id
    await db.query(
      "update public.user_packages set status='active',stripe_payment_id='manual:test' where id=$1",
      [pkg],
    )
    const row = (
      await db.query(
        'select base_sessions,bonus_sessions,sessions_total,paid_at,payment_method from public.user_packages where id=$1',
        [pkg],
      )
    ).rows[0]
    assert.equal(row.base_sessions, 4)
    assert.ok(row.paid_at)
    assert.equal(row.payment_method, 'manual')
    const expected = await rpc('posing_bonus_sessions', [
      MEMBER,
      'ruby',
      row.paid_at,
      pkg,
    ])
    assert.equal(row.bonus_sessions, expected)
    assert.equal(row.sessions_total, 4 + expected)
  })
  it('allows profile editing but prevents a member granting themselves admin controls', async () => {
    await db.exec(`create or replace function auth.uid() returns uuid language sql as $$
      select nullif(current_setting('test.user_id',true),'')::uuid $$;
      grant usage on schema public,auth to authenticated; grant select,update on public.profiles to authenticated`)
    await db.query("select set_config('test.user_id',$1,false)", [MEMBER])
    try {
      await db.exec('set role authenticated')
      await db.query(
        "update public.profiles set full_name='Edited member' where id=$1",
        [MEMBER],
      )
      await assert.rejects(
        db.query("update public.profiles set role='admin' where id=$1", [
          MEMBER,
        ]),
        /forbidden/,
      )
    } finally {
      await db.exec('reset role')
    }
    const profile = (
      await db.query('select role,full_name from public.profiles where id=$1', [
        MEMBER,
      ])
    ).rows[0]
    assert.equal(profile.role, 'client')
    assert.equal(profile.full_name, 'Edited member')
  })
  it('blocks a session that extends into unavailable time', async () => {
    const s = await slot(30)
    await db.query(
      `insert into public.availability_slots(start_at,end_at,is_blocked)
      select end_at,end_at+interval '30 minutes',true from public.availability_slots where id=$1`,
      [s],
    )
    const start = (
      await db.query(
        'select start_at from public.availability_slots where id=$1',
        [s],
      )
    ).rows[0].start_at
    const available = await rpc('posing_available_slots', [
      start,
      new Date(new Date(start).getTime() + 3600000).toISOString(),
      'diamond',
    ])
    assert.equal(available.length, 0)
    await assert.rejects(
      rpc('posing_reserve_booking', [MEMBER, s, 'diamond', 'el', 70]),
      /slot_not_available/,
    )
  })
  it('a bundle activates both products atomically and preserves access on retries', async () => {
    const purchase = (
      await db.query(
        "insert into public.moove_program_purchases(program_key,email,amount_eur) values('peach-start','member@example.test',34.9) returning id",
      )
    ).rows[0].id
    const order = (
      await db.query(
        "insert into public.nutrition_plan_orders(email,amount_eur,purchase_type,program_purchase_id,responses) values('member@example.test',45,'program_addon',$1,'{}') returning id",
        [purchase],
      )
    ).rows[0].id
    const result = await rpc('confirm_program_bundle', [
      purchase,
      'payment',
      'manual',
      ADMIN,
      true,
      'access-original',
      order,
    ])
    assert.equal(result.nutritionOrders[0].status, 'paid')
    const retry = await rpc('confirm_program_bundle', [
      purchase,
      'payment',
      'manual',
      ADMIN,
      true,
      'access-retry',
      order,
    ])
    assert.equal(retry.already, true)
    assert.equal(retry.purchase.access_token, 'access-original')
  })
  it('an unrelated nutrition order cannot partially activate a bundle', async () => {
    const purchase = (
      await db.query(
        "insert into public.moove_program_purchases(program_key,email,amount_eur) values('peach-start','member@example.test',34.9) returning id",
      )
    ).rows[0].id
    await assert.rejects(
      rpc('confirm_program_bundle', [
        purchase,
        'payment',
        'manual',
        ADMIN,
        true,
        'access',
        OTHER,
      ]),
      /invalid_nutrition_order/,
    )
    assert.equal(
      (
        await db.query(
          'select status from public.moove_program_purchases where id=$1',
          [purchase],
        )
      ).rows[0].status,
      'pending_payment',
    )
  })
  it('failure of the nutrition write rolls back the program payment', async () => {
    const purchase = (
      await db.query(
        "insert into public.moove_program_purchases(program_key,email,amount_eur) values('peach-start','member@example.test',34.9) returning id",
      )
    ).rows[0].id
    const order = (
      await db.query(
        "insert into public.nutrition_plan_orders(email,amount_eur,purchase_type,program_purchase_id,responses) values('member@example.test',45,'program_addon',$1,'{}') returning id",
        [purchase],
      )
    ).rows[0].id
    await db.exec(`create function public.fail_nutrition_update() returns trigger language plpgsql as $$ begin raise exception 'fixture_failure'; end $$;
      create trigger fixture_failure before update on public.nutrition_plan_orders for each row execute function public.fail_nutrition_update()`)
    await assert.rejects(
      rpc('confirm_program_bundle', [
        purchase,
        'payment',
        'manual',
        ADMIN,
        true,
        'access',
        order,
      ]),
      /fixture_failure/,
    )
    assert.equal(
      (
        await db.query(
          'select status from public.moove_program_purchases where id=$1',
          [purchase],
        )
      ).rows[0].status,
      'pending_payment',
    )
    await db.exec(
      'drop trigger fixture_failure on public.nutrition_plan_orders; drop function public.fail_nutrition_update()',
    )
  })
})

it('migration preserves legacy balances and records known payment times', async () => {
  const pg = await createDatabase()
  try {
    await pg.query(
      "insert into auth.users(id,email) values($1,'legacy@example.test')",
      [MEMBER],
    )
    await pg.query(
      `insert into public.user_packages(user_id,plan_key,sessions_total,sessions_used,status,stripe_payment_id,period_end)
      values($1,'ruby',5,1,'active',$2,now()+interval '30 days')`,
      [MEMBER, `manual:${ADMIN}:${Date.parse('2026-09-15T09:00:00Z')}`],
    )
    await pg.exec(
      readFileSync(
        new URL(`../supabase/migrations/${MIGRATION}`, import.meta.url),
        'utf8',
      ),
    )
    const row = (
      await pg.query(
        'select sessions_total,sessions_used,base_sessions,bonus_sessions,paid_at_source from public.user_packages',
      )
    ).rows[0]
    assert.deepEqual(row, {
      sessions_total: 5,
      sessions_used: 1,
      base_sessions: 4,
      bonus_sessions: 1,
      paid_at_source: 'manual_reference',
    })
  } finally {
    await pg.close()
  }
})
