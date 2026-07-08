import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(media.matches)
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** M3 Compact：0–599px → 手機底部導覽 */
export const MOBILE_BREAKPOINT = '(max-width: 599px)'

/** M3 Medium：600–839px */
export const TABLET_BREAKPOINT = '(min-width: 600px) and (max-width: 839px)'

/** M3 Expanded：840px+ → 頂部導覽 + 置中內容 */
export const DESKTOP_BREAKPOINT = '(min-width: 840px)'