import { handleAccess } from '../_handlers/access.js'

export default async function handler(req, res) {
  const token = String(req.query?.token ?? '').trim()
  return handleAccess(req, res, token)
}
