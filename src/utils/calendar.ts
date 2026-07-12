/** MVP 示意：鎖定當天基準日 */
export const CALENDAR_TODAY = new Date(2026, 6, 8)

export type CalendarViewMode = 'week' | 'month' | 'year'

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b)
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getWeekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function getMonthGrid(anchor: Date): (Date | null)[][] {
  const first = startOfMonth(anchor)
  const start = startOfWeek(first)
  const weeks: (Date | null)[][] = []
  let cursor = new Date(start)

  for (let w = 0; w < 6; w++) {
    const row: (Date | null)[] = []
    for (let d = 0; d < 7; d++) {
      if (cursor.getMonth() !== anchor.getMonth()) {
        row.push(null)
      } else {
        row.push(new Date(cursor))
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(row)
    const crossedMonth =
      cursor.getFullYear() > anchor.getFullYear() ||
      (cursor.getFullYear() === anchor.getFullYear() && cursor.getMonth() > anchor.getMonth())
    if (crossedMonth && cursor.getDay() === 1) break
  }
  return weeks
}

export function shiftAnchor(anchor: Date, mode: CalendarViewMode, delta: number): Date {
  const d = new Date(anchor)
  if (mode === 'week') d.setDate(d.getDate() + delta * 7)
  else if (mode === 'month') d.setMonth(d.getMonth() + delta)
  else d.setFullYear(d.getFullYear() + delta)
  return d
}

export function formatPeriodLabel(anchor: Date, mode: CalendarViewMode): string {
  const y = anchor.getFullYear()
  const m = anchor.getMonth() + 1
  if (mode === 'year') return `${y} 年`
  if (mode === 'month') return `${y} 年 ${m} 月`
  const days = getWeekDays(anchor)
  const start = days[0]
  const end = days[6]
  return `${start.getMonth() + 1}/${start.getDate()} – ${end.getMonth() + 1}/${end.getDate()}`
}

export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

export function isDateInMonth(date: Date, anchor: Date): boolean {
  return (
    date.getFullYear() === anchor.getFullYear() && date.getMonth() === anchor.getMonth()
  )
}

export function isDateInYear(date: Date, anchor: Date): boolean {
  return date.getFullYear() === anchor.getFullYear()
}

/** 將選取日限制在 anchor 所屬週／月／年內 */
export function clampDayToPeriod(
  day: Date,
  anchor: Date,
  mode: CalendarViewMode,
): Date {
  if (mode === 'week') {
    const days = getWeekDays(anchor)
    const key = toDateKey(day)
    const inWeek = days.find((d) => toDateKey(d) === key)
    return inWeek ?? days[0]
  }
  if (mode === 'month') {
    if (isDateInMonth(day, anchor)) return day
    const todayInMonth = isDateInMonth(CALENDAR_TODAY, anchor) ? CALENDAR_TODAY : null
    return todayInMonth ?? startOfMonth(anchor)
  }
  if (isDateInYear(day, anchor)) return day
  const todayInYear = isDateInYear(CALENDAR_TODAY, anchor) ? CALENDAR_TODAY : null
  return todayInYear ?? new Date(anchor.getFullYear(), 0, 1)
}