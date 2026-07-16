import { json } from '../_lib.js'
import { handleAdminBookings } from './_handlers/bookings.js'
import { handleAdminCalendarSettings } from './_handlers/calendarSettings.js'
import { handleAdminMembers } from './_handlers/members.js'
import { handleAdminSlots } from './_handlers/slots.js'

const routes = {
  bookings: handleAdminBookings,
  slots: handleAdminSlots,
  members: handleAdminMembers,
  'calendar-settings': handleAdminCalendarSettings,
}

function resolvePath(req) {
  const segments = req.query?.path ?? []
  return Array.isArray(segments) ? segments.join('/') : String(segments)
}

export default async function handler(req, res) {
  const key = resolvePath(req)
  const route = routes[key]
  if (!route) return json(res, 404, { ok: false, error: 'not_found' })
  return route(req, res)
}
