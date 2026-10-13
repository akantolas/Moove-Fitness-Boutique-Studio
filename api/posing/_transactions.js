/** Server-only RPCs fail closed when their migration is unavailable. */
export async function runPosingTransaction(supabase, name, args = {}) {
  const { data, error } = await supabase.rpc(name, args)
  if (error) {
    if (error.code === 'PGRST202' || error.code === '42883') {
      return { ok: false, error: 'migration_required' }
    }
    const known =
      /^(booking_not_found|package_not_found|purchase_not_found|invalid_[a-z_]+|forbidden|cannot_cancel|slot_[a-z_]+|payment_required_first|outside_package_period|package_not_active|no_available_sessions|adjustment_conflict|session_not_finished)$/
    console.error('posing transaction failed:', {
      name,
      code: error.code,
      message: error.message,
    })
    return {
      ok: false,
      error: known.test(error.message) ? error.message : 'operation_failed',
    }
  }
  return data
}

export async function requirePosingTransaction(supabase, name, args = {}) {
  const result = await runPosingTransaction(supabase, name, args)
  if (result?.ok === false) throw new Error(result.error)
  if (result == null) throw new Error('operation_failed')
  return result
}
