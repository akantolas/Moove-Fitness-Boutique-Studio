import { json, resolveApiPath } from '../../posing/_lib.js'
import { handleAdminPrograms } from './_handlers/programs.js'

const BASE_PREFIX = '/api/programs/admin/'

export default async function handler(req, res) {
  const key = resolveApiPath(req, BASE_PREFIX)
  if (key === 'programs' || key === '') return handleAdminPrograms(req, res)
  return json(res, 404, { ok: false, error: 'not_found' })
}
