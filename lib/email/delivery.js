/** Tracks delivery independently of the payment state; callers can retry safely. */
export async function trackDelivery(supabase, table, id, sentField, send) {
  const started = await supabase
    .from(table)
    .update({
      delivery_status: 'pending',
      delivery_error: null,
      delivery_attempted_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (started.error) throw new Error('delivery_record_failed')
  try {
    const result = await send()
    if (result?.ok === false) throw new Error(result.error ?? 'delivery_failed')
    const saved = await supabase
      .from(table)
      .update({
        delivery_status: 'sent',
        delivery_error: null,
        [sentField]: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (saved.error) throw new Error('delivery_record_failed')
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'delivery_failed'
    const saved = await supabase
      .from(table)
      .update({
        delivery_status: 'failed',
        delivery_error: message.slice(0, 500),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (saved.error)
      console.error('delivery failure record failed:', { table, id })
    return { ok: false, error: message }
  }
}
