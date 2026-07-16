import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  adminConfirmPayment,
  adminCreateSlot,
  adminDeleteMember,
  adminDeleteMemberPrice,
  adminDeleteSlot,
  adminUpdateSlot,
  adminUpsertMemberPrice,
  fetchAdminBookings,
  fetchAdminCalendarSettings,
  fetchAdminMembers,
  fetchAdminOverview,
  fetchAdminPayments,
  fetchAdminSlots,
  saveAdminCalendarSettings,
  type AdminBookingRow,
  type AdminCalendarSlot,
  type AdminMember,
  type AdminOverviewStats,
  type AdminPayment,
  type CalendarSettings,
} from '../lib/posingApi'
import {
  athensDateKey,
  athensTimeKey,
  buildSlotEndIso,
  buildSlotIso,
  cellKey,
  DEFAULT_CALENDAR_SETTINGS,
  getWeekdayTemplateForDay,
  isPastCell,
  normalizeTimeInput,
} from '../lib/posingDates'

export const ADMIN_TABS = ['overview', 'calendar', 'members', 'payments', 'bookings'] as const
export type AdminTab = (typeof ADMIN_TABS)[number]

export function isAdminTab(value: string | null): value is AdminTab {
  return ADMIN_TABS.includes(value as AdminTab)
}

export type CalendarFeedback = {
  type: 'slots_created' | 'slots_deleted' | 'settings_saved'
  count?: number
} | null

export function translateAdminError(code: string, t: (key: string) => string): string {
  const keys = [
    `posing.admin.adminErrors.${code}`,
    `posing.admin.memberErrors.${code}`,
  ] as const
  for (const key of keys) {
    const translated = t(key)
    if (translated !== key) return translated
  }
  return code
}

type UsePosingAdminPanelOptions = {
  activeTab: AdminTab
  accessToken: string | null
  authorized: boolean
  range: { from: string; to: string }
  bookingStatusFilter: string
  duration: number
  translate: (key: string) => string
}

export type AdminCellState = 'empty' | 'available' | 'inactive'

export function usePosingAdminPanel({
  activeTab,
  accessToken,
  authorized,
  range,
  bookingStatusFilter,
  duration,
  translate,
}: UsePosingAdminPanelOptions) {
  const [slots, setSlots] = useState<AdminCalendarSlot[]>([])
  const [members, setMembers] = useState<AdminMember[]>([])
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [bookings, setBookings] = useState<AdminBookingRow[]>([])
  const [stats, setStats] = useState<AdminOverviewStats | null>(null)
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>(DEFAULT_CALENDAR_SETTINGS)
  const [calendarSettingsLoaded, setCalendarSettingsLoaded] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [calendarFeedback, setCalendarFeedback] = useState<CalendarFeedback>(null)
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const slotByCell = useMemo(() => {
    const map = new Map<string, AdminCalendarSlot>()
    for (const slot of slots) {
      const dayKey = athensDateKey(new Date(slot.start_at))
      const time = athensTimeKey(slot.start_at)
      map.set(cellKey(dayKey, time), slot)
    }
    return map
  }, [slots])

  const showCalendarFeedback = useCallback((feedback: NonNullable<CalendarFeedback>) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    setCalendarFeedback(feedback)
    feedbackTimerRef.current = setTimeout(() => setCalendarFeedback(null), 3200)
  }, [])

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
    }
  }, [])

  const loadSlots = useCallback(async () => {
    if (!accessToken) return
    setSlots(await fetchAdminSlots(accessToken, range.from, range.to))
  }, [accessToken, range.from, range.to])

  const loadCalendarSettings = useCallback(async () => {
    if (!accessToken) return
    const settings = await fetchAdminCalendarSettings(accessToken)
    setCalendarSettings(settings)
    setCalendarSettingsLoaded(true)
    return settings
  }, [accessToken])

  const loadMembers = useCallback(async () => {
    if (!accessToken) return
    setMembers(await fetchAdminMembers(accessToken))
  }, [accessToken])

  const loadPayments = useCallback(async () => {
    if (!accessToken) return
    setPayments(await fetchAdminPayments(accessToken))
  }, [accessToken])

  const loadBookings = useCallback(
    async (status?: string) => {
      if (!accessToken) return
      setBookings(await fetchAdminBookings(accessToken, status || undefined))
    },
    [accessToken],
  )

  const loadStats = useCallback(async () => {
    if (!accessToken) return
    setStats(await fetchAdminOverview(accessToken))
  }, [accessToken])

  const loadTab = useCallback(
    async (tab: AdminTab) => {
      if (!accessToken) return
      setLoading(true)
      setError('')
      try {
        if (tab === 'overview') {
          await Promise.all([loadStats(), loadPayments()])
        } else if (tab === 'calendar') {
          await Promise.all([loadSlots(), loadCalendarSettings()])
        } else if (tab === 'members') {
          await loadMembers()
        } else if (tab === 'payments') {
          await loadPayments()
        } else if (tab === 'bookings') {
          await loadBookings(bookingStatusFilter)
        }
      } catch (err) {
        const code = err instanceof Error ? err.message : 'load_failed'
        setError(translateAdminError(code, translate))
      } finally {
        setLoading(false)
      }
    },
    [
      accessToken,
      bookingStatusFilter,
      loadBookings,
      loadCalendarSettings,
      loadMembers,
      loadPayments,
      loadSlots,
      loadStats,
      translate,
    ],
  )

  const refresh = useCallback(() => loadTab(activeTab), [activeTab, loadTab])

  const refreshAfterPayment = useCallback(async () => {
    await Promise.all([loadPayments(), loadStats(), loadBookings(bookingStatusFilter)])
  }, [bookingStatusFilter, loadBookings, loadPayments, loadStats])

  useEffect(() => {
    if (!authorized) return
    void loadTab(activeTab)
  }, [authorized, activeTab, range.from, range.to, accessToken, loadTab])

  useEffect(() => {
    if (!authorized || activeTab !== 'bookings') return
    void loadBookings(bookingStatusFilter).catch((err) => {
      const code = err instanceof Error ? err.message : 'load_failed'
      setError(translateAdminError(code, translate))
    })
  }, [authorized, activeTab, bookingStatusFilter, loadBookings, translate])

  async function setCellState(dayKey: string, time: string, state: AdminCellState) {
    if (!accessToken || isPastCell(dayKey, time)) return
    const existing = slotByCell.get(cellKey(dayKey, time))
    if (existing?.booking) return

    setBusy(true)
    setError('')
    try {
      if (state === 'empty') {
        if (existing) await adminDeleteSlot(accessToken, existing.id)
      } else if (state === 'available') {
        if (existing) {
          if (existing.is_blocked) {
            await adminUpdateSlot(accessToken, existing.id, { is_blocked: false })
          }
        } else {
          await adminCreateSlot(
            accessToken,
            buildSlotIso(dayKey, time),
            buildSlotEndIso(dayKey, time, duration),
            false,
          )
        }
      } else if (state === 'inactive') {
        if (existing) {
          if (!existing.is_blocked) {
            await adminUpdateSlot(accessToken, existing.id, { is_blocked: true })
          }
        } else {
          await adminCreateSlot(
            accessToken,
            buildSlotIso(dayKey, time),
            buildSlotEndIso(dayKey, time, duration),
            true,
          )
        }
      }
      await loadSlots()
    } catch (err) {
      const code = err instanceof Error ? err.message : 'toggle_failed'
      setError(translateAdminError(code, translate))
    } finally {
      setBusy(false)
    }
  }

  async function addSlotAtTime(dayKey: string, rawTime: string) {
    if (!accessToken) return
    const time = normalizeTimeInput(rawTime)
    if (!time) {
      setError(translateAdminError('invalid_time', translate))
      return
    }
    if (isPastCell(dayKey, time)) return
    if (slotByCell.has(cellKey(dayKey, time))) {
      setError(translateAdminError('time_exists', translate))
      return
    }

    setBusy(true)
    setError('')
    try {
      await adminCreateSlot(
        accessToken,
        buildSlotIso(dayKey, time),
        buildSlotEndIso(dayKey, time, duration),
      )
      await loadSlots()
      showCalendarFeedback({ type: 'slots_created', count: 1 })
    } catch (err) {
      const code = err instanceof Error ? err.message : 'toggle_failed'
      setError(translateAdminError(code, translate))
    } finally {
      setBusy(false)
    }
  }

  async function openDayPreset(dayKey: string) {
    if (!accessToken) return
    setBusy(true)
    setError('')
    try {
      const templateTimes = getWeekdayTemplateForDay(dayKey, calendarSettings).times
      const toCreate = templateTimes.filter((time) => {
        if (isPastCell(dayKey, time)) return false
        return !slotByCell.has(cellKey(dayKey, time))
      })
      await Promise.all(
        toCreate.map((time) =>
          adminCreateSlot(
            accessToken,
            buildSlotIso(dayKey, time),
            buildSlotEndIso(dayKey, time, duration),
          ),
        ),
      )
      await loadSlots()
      if (toCreate.length > 0) {
        showCalendarFeedback({ type: 'slots_created', count: toCreate.length })
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : 'preset_failed'
      setError(translateAdminError(code, translate))
    } finally {
      setBusy(false)
    }
  }

  async function clearDay(dayKey: string) {
    if (!accessToken) return
    setBusy(true)
    setError('')
    try {
      const toDelete = slots.filter((slot) => {
        if (athensDateKey(new Date(slot.start_at)) !== dayKey) return false
        return !slot.booking
      })
      await Promise.all(toDelete.map((slot) => adminDeleteSlot(accessToken, slot.id)))
      await loadSlots()
      if (toDelete.length > 0) {
        showCalendarFeedback({ type: 'slots_deleted', count: toDelete.length })
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : 'clear_failed'
      setError(translateAdminError(code, translate))
    } finally {
      setBusy(false)
    }
  }

  async function saveCalendarSettings(
    payload: Omit<CalendarSettings, 'updated_at'>,
  ): Promise<CalendarSettings> {
    if (!accessToken) throw new Error('unauthorized')
    setBusy(true)
    setError('')
    try {
      const saved = await saveAdminCalendarSettings(accessToken, payload)
      setCalendarSettings(saved)
      showCalendarFeedback({ type: 'settings_saved' })
      return saved
    } catch (err) {
      const code = err instanceof Error ? err.message : 'settings_save_failed'
      const message = translateAdminError(code, translate)
      setError(message)
      throw new Error(message)
    } finally {
      setBusy(false)
    }
  }

  async function deleteMember(memberId: string) {
    if (!accessToken) return
    setBusy(true)
    setError('')
    try {
      await adminDeleteMember(accessToken, memberId)
      await loadMembers()
      await loadStats()
    } catch (err) {
      const code = err instanceof Error ? err.message : 'delete_member_failed'
      const message = translateAdminError(code, translate)
      setError(message)
      throw new Error(message)
    } finally {
      setBusy(false)
    }
  }

  async function saveMemberPrice(userId: string, planKey: string, priceEur: number) {
    if (!accessToken) throw new Error('unauthorized')
    await adminUpsertMemberPrice(accessToken, userId, planKey, priceEur)
    await loadMembers()
  }

  async function removeMemberPrice(userId: string, planKey: string) {
    if (!accessToken) throw new Error('unauthorized')
    await adminDeleteMemberPrice(accessToken, userId, planKey)
    await loadMembers()
  }

  async function confirmPayment(bookingId: string) {
    if (!accessToken) return
    setBusy(true)
    setError('')
    try {
      await adminConfirmPayment(accessToken, bookingId)
      await refreshAfterPayment()
    } catch (err) {
      const code = err instanceof Error ? err.message : 'payment_confirm_failed'
      const message = translateAdminError(code, translate)
      setError(message)
      throw new Error(message)
    } finally {
      setBusy(false)
    }
  }

  return {
    slots,
    members,
    payments,
    bookings,
    stats,
    calendarSettings,
    calendarSettingsLoaded,
    error,
    busy,
    loading,
    calendarFeedback,
    refresh,
    setCellState,
    addSlotAtTime,
    openDayPreset,
    clearDay,
    saveCalendarSettings,
    deleteMember,
    saveMemberPrice,
    removeMemberPrice,
    confirmPayment,
  }
}
