import { useEffect, useState, type RefObject } from 'react'

export function useElementHeight<T extends HTMLElement>(
  ref: RefObject<T | null>,
  deps: unknown[] = [],
): number {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => setHeight(el.getBoundingClientRect().height)
    update()

    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, ...deps])

  return height
}