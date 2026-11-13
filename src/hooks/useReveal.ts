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
    const reveal: IntersectionObserverCallback = (entries, source) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        source.unobserve(entry.target)
      }
    }
    const observer = new IntersectionObserver(reveal, { rootMargin: '0px 0px -12% 0px' })
    // data-reveal="late" waits until the block is well inside the screen, for tall blocks
    // whose entrance would otherwise play before anyone can see it.
    const lateObserver = new IntersectionObserver(reveal, { rootMargin: '0px 0px -35% 0px' })
    const watch = () =>
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)')
        .forEach((block) => (block.dataset.reveal === 'late' ? lateObserver : observer).observe(block))
    watch()
    const added = new MutationObserver(watch)
    added.observe(document.body, { childList: true, subtree: true })
    return () => {
      added.disconnect()
      observer.disconnect()
      lateObserver.disconnect()
      root.classList.remove('motion-ready')
    }
  }, [])
}
