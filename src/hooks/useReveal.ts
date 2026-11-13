import { useEffect } from 'react'

/**
 * Marks the page as ready for entrances and reveals each [data-reveal] block once,
 * including blocks that render later (the reviews arrive after a fetch).
 */
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement
    if (!('IntersectionObserver' in window)) return
    root.classList.add('motion-ready')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    const watch = () =>
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((block) => observer.observe(block))
    watch()
    const added = new MutationObserver(watch)
    added.observe(document.body, { childList: true, subtree: true })
    return () => {
      added.disconnect()
      observer.disconnect()
      root.classList.remove('motion-ready')
    }
  }, [])
}
