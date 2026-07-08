import { useEffect, useState } from 'react'

/** 依 visualViewport 推算虛擬鍵盤佔用高度，供固定底部區塊上移 */
export function useMobileKeyboardOffset(enabled: boolean): number {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setOffset(0)
      return
    }

    const viewport = window.visualViewport
    if (!viewport) return

    const update = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      setOffset(inset)
    }

    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [enabled])

  return offset
}