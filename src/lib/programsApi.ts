export type ProgramPurchasePayment = {
  id: string
  program_key: string
  email: string
  amount_eur: number
  status: string
  created_at: string
  purchase_ref: string
  program_name: string
}

export type ProgramPaidPurchase = ProgramPurchasePayment & {
  payment_method: string | null
  access_email_sent_at: string | null
}

export type ProgramAccessExercise = {
  name: string
  sets: string | null
  notes: string | null
  videoId: string | null
}

export type ProgramAccessSection = {
  title: string
  exercises: ProgramAccessExercise[]
}

export type ProgramAccessMeta = {
  duration: string
  goal: string
  progressNote: string
}

export type ProgramAccessContent = {
  title: string
  programKey: string
  meta?: ProgramAccessMeta
  sections: ProgramAccessSection[]
}

async function parseApiJson(res: Response) {
  const text = await res.text()
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error(text.startsWith('A server error') ? 'server_config_error' : 'invalid_api_response')
  }
}

export async function createProgramOrder(payload: {
  programKey: string
  email: string
  locale: string
}) {
  const res = await fetch('/api/programs/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'order_failed'))
  return data as {
    ok: boolean
    purchaseId: string
    purchaseRef: string
    status: string
  }
}

export async function fetchProgramOrderStatus(ref: string) {
  const res = await fetch(`/api/programs/order-status?ref=${encodeURIComponent(ref)}`)
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'status_failed'))
  return data as { ok: boolean; status: string; purchaseRef: string }
}

export async function fetchProgramAccess(token: string, locale: string) {
  const res = await fetch(
    `/api/programs/access/${encodeURIComponent(token)}?locale=${encodeURIComponent(locale)}`,
  )
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'access_failed'))
  return data as ProgramAccessContent & { ok: boolean }
}

export async function fetchAdminProgramPayments(accessToken: string): Promise<ProgramPurchasePayment[]> {
  const res = await fetch('/api/programs/admin/programs?view=payments', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'payments_fetch_failed'))
  return (data.payments ?? []) as ProgramPurchasePayment[]
}

export async function fetchAdminProgramPurchases(accessToken: string): Promise<ProgramPaidPurchase[]> {
  const res = await fetch('/api/programs/admin/programs?view=purchases', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'purchases_fetch_failed'))
  return (data.purchases ?? []) as ProgramPaidPurchase[]
}

export async function adminConfirmProgramPayment(accessToken: string, purchaseId: string) {
  const res = await fetch('/api/programs/admin/programs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action: 'confirm', purchase_id: purchaseId }),
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'payment_confirm_failed'))
  return data as { ok: boolean; already?: boolean }
}

export async function adminResendProgramAccess(accessToken: string, purchaseId: string) {
  const res = await fetch('/api/programs/admin/programs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action: 'resend-access', purchase_id: purchaseId }),
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'resend_failed'))
}
