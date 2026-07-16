import { json } from './_lib.js'
import { handleAccountDelete } from './_handlers/accountDelete.js'
import { handleBookings } from './_handlers/bookings.js'
import { handleHealth } from './_handlers/health.js'
import { handleMe } from './_handlers/me.js'
import { handleSlots } from './_handlers/slots.js'

const routes = {
  health: handleHealth,
  me: handleMe,
  slots: handleSlots,
  bookings: handleBookings,
  'account/delete': handleAccountDelete,
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
