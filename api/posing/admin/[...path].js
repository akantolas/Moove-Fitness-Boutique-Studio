import { json, resolveApiPath } from '../_lib.js'
import { handleAdminBookings } from './_handlers/bookings.js'
import { handleAdminCalendarSettings } from './_handlers/calendarSettings.js'
import { handleAdminMembers } from './_handlers/members.js'
import { handleAdminSlots } from './_handlers/slots.js'

const BASE_PREFIX = '/api/posing/admin/'

const routes = {
  bookings: handleAdminBookings,
  slots: handleAdminSlots,
  members: handleAdminMembers,
  'calendar-settings': handleAdminCalendarSettings,
}

export default async function handler(req, res) {
  const key = resolveApiPath(req, BASE_PREFIX)
  const route = routes[key]
  if (!route) return json(res, 404, { ok: false, error: 'not_found' })
  return route(req, res)
}
