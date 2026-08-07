import { json, resolveApiPath } from '../../posing/_lib.js'
import { handleAdminNutritionOrders } from './_handlers/orders.js'

const BASE_PREFIX = '/api/nutrition/admin/'

export default async function handler(req, res) {
  const key = resolveApiPath(req, BASE_PREFIX)
  if (key === 'orders' || key === '') return handleAdminNutritionOrders(req, res)
  return json(res, 404, { ok: false, error: 'not_found' })
}
