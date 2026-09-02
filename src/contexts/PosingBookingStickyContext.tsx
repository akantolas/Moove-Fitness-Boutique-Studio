import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type PosingBookingStickyState =
  | { mode: 'navigate' }
  | { mode: 'hidden' }
  | {
      mode: 'confirm'
      slotLabel: string
      disabled: boolean
      loading: boolean
      sessionReady: boolean
    }

type ConfirmDetails = {
  slotLabel: string
  disabled: boolean
  loading: boolean
  sessionReady: boolean
}

type PosingBookingStickyContextValue = {
  sticky: PosingBookingStickyState
  setBookingSectionVisible: (visible: boolean) => void
  setConfirmDetails: (details: ConfirmDetails | null, onConfirm?: () => void) => void
  triggerConfirm: () => void
  resetSticky: () => void
}

const PosingBookingStickyContext = createContext<PosingBookingStickyContextValue | null>(null)

export function PosingBookingStickyProvider({ children }: { children: ReactNode }) {
  const [bookingSectionVisible, setBookingSectionVisible] = useState(false)
  const [confirmDetails, setConfirmDetails] = useState<ConfirmDetails | null>(null)
  const confirmHandlerRef = useRef<(() => void) | null>(null)

  const setConfirmDetailsWithHandler = useCallback(
    (details: ConfirmDetails | null, onConfirm?: () => void) => {
      if (details && onConfirm) {
        confirmHandlerRef.current = onConfirm
        setConfirmDetails(details)
        return
      }
      confirmHandlerRef.current = null
      setConfirmDetails(null)
    },
    [],
  )

  const triggerConfirm = useCallback(() => {
    confirmHandlerRef.current?.()
  }, [])

  const resetSticky = useCallback(() => {
    confirmHandlerRef.current = null
    setConfirmDetails(null)
    setBookingSectionVisible(false)
  }, [])

  const sticky = useMemo((): PosingBookingStickyState => {
    if (confirmDetails) {
      return { mode: 'confirm', ...confirmDetails }
    }
    if (bookingSectionVisible) {
      return { mode: 'hidden' }
    }
    return { mode: 'navigate' }
  }, [bookingSectionVisible, confirmDetails])

  const value = useMemo(
    (): PosingBookingStickyContextValue => ({
      sticky,
      setBookingSectionVisible,
      setConfirmDetails: setConfirmDetailsWithHandler,
      triggerConfirm,
      resetSticky,
    }),
    [sticky, setConfirmDetailsWithHandler, triggerConfirm, resetSticky],
  )

  return (
    <PosingBookingStickyContext.Provider value={value}>
      {children}
    </PosingBookingStickyContext.Provider>
  )
}

export function usePosingBookingSticky() {
  return useContext(PosingBookingStickyContext)
}
