import type { NutritionPaidOrder, NutritionOrderPayment } from './nutritionTypes'

async function parseApiJson(res: Response) {
  const text = await res.text()
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error(text.startsWith('A server error') ? 'server_config_error' : 'invalid_api_response')
  }
}

export async function fetchAdminNutritionPayments(accessToken: string): Promise<NutritionOrderPayment[]> {
  const res = await fetch('/api/nutrition/admin/orders?view=payments', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'payments_fetch_failed'))
  return (data.payments ?? []) as NutritionOrderPayment[]
}

export async function fetchAdminNutritionOrders(accessToken: string): Promise<NutritionPaidOrder[]> {
  const res = await fetch('/api/nutrition/admin/orders?view=orders', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'orders_fetch_failed'))
  return (data.orders ?? []) as NutritionPaidOrder[]
}

export async function adminConfirmNutritionPayment(accessToken: string, orderId: string) {
  const res = await fetch('/api/nutrition/admin/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action: 'confirm', order_id: orderId }),
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'payment_confirm_failed'))
  return data as { ok: boolean; already?: boolean }
}

export async function adminResendNutritionPlan(accessToken: string, orderId: string) {
  const res = await fetch('/api/nutrition/admin/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action: 'resend', order_id: orderId }),
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'resend_failed'))
}

export async function fetchAdminNutritionPreviewUrl(accessToken: string, orderId: string) {
  const res = await fetch(
    `/api/nutrition/admin/orders?view=preview&order_id=${encodeURIComponent(orderId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'preview_failed'))
  return String(data.url ?? '')
}
