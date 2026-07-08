import { useEffect, useState, type RefObject } from 'react'

/** 捲動時收起頂部列，停滯 idleMs 後再顯示 */
export function useCollapsingHeader(
  scrollRef: RefObject<HTMLElement | null>,
  idleMs = 1000,
  resetKey?: unknown,
): boolean {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
    setVisible(true)
  }, [resetKey, scrollRef])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let idleTimer: ReturnType<typeof setTimeout> | undefined

    const scheduleReveal = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => setVisible(true), idleMs)
    }

    const onScroll = () => {
      setVisible(false)
      scheduleReveal()
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      clearTimeout(idleTimer)
    }
  }, [scrollRef, idleMs])

  return visible
}