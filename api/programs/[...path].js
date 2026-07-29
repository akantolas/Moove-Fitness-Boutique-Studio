import { json, resolveApiPath } from '../posing/_lib.js'
import { handleAccess } from './_handlers/access.js'
import { handleOrder, handleOrderStatus } from './_handlers/order.js'

const BASE_PREFIX = '/api/programs/'

export default async function handler(req, res) {
  const key = resolveApiPath(req, BASE_PREFIX)

  if (key === 'order') return handleOrder(req, res)
  if (key === 'order-status') return handleOrderStatus(req, res)
  if (key.startsWith('access/')) {
    const token = key.slice('access/'.length)
    return handleAccess(req, res, token)
  }

  return json(res, 404, { ok: false, error: 'not_found' })
}
