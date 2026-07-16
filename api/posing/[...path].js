import { json, resolveApiPath } from './_lib.js'
import { handleAccountDelete } from './_handlers/accountDelete.js'
import { handleBookings } from './_handlers/bookings.js'
import { handleHealth } from './_handlers/health.js'
import { handleMe } from './_handlers/me.js'
import { handleSlots } from './_handlers/slots.js'

const BASE_PREFIX = '/api/posing/'

const routes = {
  health: handleHealth,
  me: handleMe,
  slots: handleSlots,
  bookings: handleBookings,
  'account/delete': handleAccountDelete,
}

export default async function handler(req, res) {
  const key = resolveApiPath(req, BASE_PREFIX)
  const route = routes[key]
  if (!route) return json(res, 404, { ok: false, error: 'not_found' })
  return route(req, res)
}
