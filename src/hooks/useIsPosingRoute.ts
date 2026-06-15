import { useLocation } from 'react-router-dom'

export function useIsPosingRoute() {
  const { pathname } = useLocation()
  return pathname === '/posing'
}
