import { useEffect, useState, type RefObject } from 'react'

export function useBookingSectionVisible(sectionRef: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: '-72px 0px -96px 0px',
        threshold: 0.12,
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [sectionRef])

  return visible
}
