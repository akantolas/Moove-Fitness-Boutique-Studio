import { useEffect, useState } from 'react'

/** Refresh time-based states without relying on unrelated renders. */
export function useCurrentTime() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])
  return now
}
