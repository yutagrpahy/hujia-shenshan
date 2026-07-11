import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { URGENCY_LABELS } from '../../data/mockData'
import type { TodoItem } from '../../types'
import {
  CALENDAR_TODAY,
  formatPeriodLabel,
  getMonthGrid,
  getWeekDays,
  isSameDay,
  parseDateKey,
  shiftAnchor,
  toDateKey,
  WEEKDAY_LABELS,
  type CalendarViewMode,
} from '../../utils/calendar'
import {
  CardItem,
  CardItemChevron,
  CardItemDetail,

  CardItemTriAction,
  CardItemTriIndicator,
  CardItemTriMain,
  CardItemTriRow,
  CardItemSubtitle,
  CardItemTitle,
  CardSectionTitle,
  PageSection,
  StackList,
} from '../common/CardLayout'
import { useApp } from '../../context/AppContext'
import { TodoDetailFlow } from '../common/TodoDetailFlow'

const URGENCY_STYLES = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-sand-100 text-gray-500',
}

const VIEW_MODES: { id: CalendarViewMode; label: string }[] = [
  { id: 'week', label: '週' },
  { id: 'month', label: '月' },
  { id: 'year', label: '年' },
]

const URGENCY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-red-400',
  low: 'bg-red-300',
}

const SWIPE_THRESHOLD_PX = 48

export function TodoCalendarPanel({ todos }: { todos: TodoItem[] }) {
  const { completeTodo } = useApp()
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week')
  const [anchor, setAnchor] = useState(CALENDAR_TODAY)
  const [selectedDay, setSelectedDay] = useState(CALENDAR_TODAY)
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null)
  const touchStartX = useRef<number | null>(null)

  const pending = todos.filter((t) => !t.completed)

  const todosByDate = useMemo(() => {
    const map = new Map<string, TodoItem[]>()
    for (const todo of pending) {
      if (!todo.dueDate) continue
      const list = map.get(todo.dueDate) ?? []
      list.push(todo)
      map.set(todo.dueDate, list)
    }
    return map
  }, [pending])

  const selectedDayTodos = useMemo(() => {
    const key = toDateKey(selectedDay)
    return todosByDate.get(key) ?? []
  }, [selectedDay, todosByDate])

  const weekDays = getWeekDays(anchor)
  const monthGrid = getMonthGrid(anchor)
  const yearMonths = Array.from({ length: 12 }, (_, i) => new Date(anchor.getFullYear(), i, 1))

  const handleDaySelect = (day: Date) => {
    setSelectedDay(day)
    setSelectedTodo(null)
  }

  const shiftPeriod = (delta: number) => {
    setAnchor((current) => shiftAnchor(current, viewMode, delta))
  }

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const endX = event.changedTouches[0]?.clientX
    if (endX == null) return
    const delta = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    shiftPeriod(delta < 0 ? 1 : -1)
  }

  const renderTodoBadge = (day: Date) => {
    const dayTodos = todosByDate.get(toDateKey(day))
    if (!dayTodos?.length) return null
    const urgent = dayTodos.some((t) => t.urgency === 'high')
    return (
      <span
        className={`calendar-day-badge ${urgent ? 'calendar-day-badge--high' : 'calendar-day-badge--normal'}`}
        aria-label="有待辦"
      />
    )
  }

  const circleClass = (day: Date) => {
    const isSelected = isSameDay(day, selectedDay)
    const isToday = isSameDay(day, CALENDAR_TODAY)
    return [
      'calendar-day-circle',
      isSelected ? 'calendar-day-circle--selected' : '',
      !isSelected && isToday ? 'calendar-day-circle--today' : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  const renderCalendarView = () => {
    if (viewMode === 'week') {
      return (
        <div className="calendar-grid-7">
          {weekDays.map((day, i) => {
            const hasTodos = todosByDate.has(toDateKey(day))
            return (
              <button
                key={toDateKey(day)}
                type="button"
                onClick={() => handleDaySelect(day)}
                className="calendar-day-cell"
              >
                <span className="calendar-day-weekday">{WEEKDAY_LABELS[i]}</span>
                <span className={circleClass(day)}>
                  {day.getDate()}
                  {hasTodos && renderTodoBadge(day)}
                </span>
              </button>
            )
          })}
        </div>
      )
    }

    if (viewMode === 'month') {
      return (
        <div className="ds-section-inner">
          <div className="calendar-grid-7">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className="text-caption text-center py-0.5 min-w-0">
                {label}
              </span>
            ))}
          </div>
          <div className="calendar-grid-7">
            {monthGrid.flat().map((day, i) =>
              day ? (
                <button
                  key={toDateKey(day)}
                  type="button"
                  onClick={() => handleDaySelect(day)}
                  className="calendar-month-cell"
                >
                  <span className={circleClass(day)}>
                    {day.getDate()}
                    {todosByDate.has(toDateKey(day)) && renderTodoBadge(day)}
                  </span>
                </button>
              ) : (
                <div key={`empty-${i}`} />
              ),
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {yearMonths.map((monthStart) => {
          const count = pending.filter((t) => {
            if (!t.dueDate) return false
            const d = parseDateKey(t.dueDate)
            return d.getFullYear() === monthStart.getFullYear() && d.getMonth() === monthStart.getMonth()
          }).length
          return (
            <button
              key={monthStart.getMonth()}
              type="button"
              onClick={() => {
                setViewMode('month')
                setAnchor(monthStart)
              }}
              className="m3-card p-3 text-left hover:bg-sand-50 transition-colors relative"
            >
              <p className="text-sm font-medium text-gray-700">{monthStart.getMonth() + 1} 月</p>
              <p className="text-caption mt-0.5">
                {count > 0 ? `${count} 項待辦` : '無待辦'}
              </p>
              {count > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <PageSection title="待辦事件" count={`${pending.length} 項待處理`} fullWidth>
      <div className="m3-card m3-card--section overflow-hidden">
        <div className="ds-section-inner min-w-0">
          <div className="calendar-toolbar">
            <div className="calendar-toolbar__modes">
              {VIEW_MODES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewMode(id)}
                  className={`m3-chip ${viewMode === id ? 'm3-chip--selected' : 'm3-chip--muted'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="calendar-toolbar__period">{formatPeriodLabel(anchor, viewMode)}</span>
            <div className="calendar-toolbar__nav" aria-label="切換週期">
              <button
                type="button"
                onClick={() => shiftPeriod(-1)}
                className="calendar-toolbar__nav-btn"
                aria-label="上一段"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => shiftPeriod(1)}
                className="calendar-toolbar__nav-btn"
                aria-label="下一段"
              >
                <ChevronRight className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>

          <div
            className="calendar-body__surface"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {renderCalendarView()}
          </div>

          <div className="ds-section-divider ds-section-inner">
            <CardSectionTitle as="h4">
              {toDateKey(selectedDay) === toDateKey(CALENDAR_TODAY) ? '今日' : toDateKey(selectedDay)}{' '}
              待辦
            </CardSectionTitle>
            {selectedDayTodos.length === 0 ? (
              <p className="text-caption py-1">這天沒有待辦事項</p>
            ) : (
              <StackList>
                {selectedDayTodos.map((todo) => (
                  <CardItem
                    key={todo.id}
                    as="button"
                    interactive
                    onClick={() => setSelectedTodo(todo)}
                  >
                    <CardItemTriRow>
                      <CardItemTriMain>
                        <CardItemTitle>{todo.title}</CardItemTitle>
                        <CardItemSubtitle className="text-caption">
                          {todo.memberName}
                        </CardItemSubtitle>
                        <CardItemDetail>
                          <span className={`m3-chip ${URGENCY_STYLES[todo.urgency] ?? ''}`}>
                            {URGENCY_LABELS[todo.urgency]}
                          </span>
                        </CardItemDetail>
                      </CardItemTriMain>
                      <CardItemTriIndicator>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${URGENCY_DOT[todo.urgency]}`}
                          aria-hidden
                        />
                      </CardItemTriIndicator>
                      <CardItemTriAction>
                        <CardItemChevron />
                      </CardItemTriAction>
                    </CardItemTriRow>
                  </CardItem>
                ))}
              </StackList>
            )}
          </div>
        </div>
      </div>

      <TodoDetailFlow
        todo={selectedTodo}
        isOpen={!!selectedTodo}
        onOpenChange={(open) => !open && setSelectedTodo(null)}
        onCompleteTodo={completeTodo}
      />
    </PageSection>
  )
}