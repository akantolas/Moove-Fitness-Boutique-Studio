import { useLocation } from 'react-router-dom'

export const posingBookingHref = '/posing#booking'
export const posingPackagesHref = '/posing#packages'

export function useIsPosingRoute() {
  const { pathname } = useLocation()
  return pathname.startsWith('/posing')
}
