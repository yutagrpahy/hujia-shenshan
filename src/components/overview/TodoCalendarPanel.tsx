import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
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
import { TodoDetailModal } from './TodoDetailModal'

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

export function TodoCalendarPanel({
  todos,
  onViewAll,
}: {
  todos: TodoItem[]
  onViewAll: () => void
}) {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week')
  const [anchor, setAnchor] = useState(CALENDAR_TODAY)
  const [selectedDay, setSelectedDay] = useState(CALENDAR_TODAY)
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null)

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
    const dayTodos = todosByDate.get(toDateKey(day)) ?? []
    if (dayTodos.length === 1) setSelectedTodo(dayTodos[0])
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

  return (
    <section className="overview-grid--full w-full max-w-full min-w-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          待辦事件
        </h3>
        <span className="text-[10px] text-gray-400">{pending.length} 項待處理</span>
      </div>

      <div className="m3-card p-4 w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex flex-col gap-2 mb-3 min-w-0">
          <div className="flex gap-1 shrink-0">
            {VIEW_MODES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setViewMode(id)}
                className={`m3-chip px-2.5 py-1 text-[10px] font-medium ${
                  viewMode === id ? 'bg-teal-500 text-white' : 'bg-sand-100 text-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 min-w-0 w-full justify-end">
            <button
              type="button"
              onClick={() => setAnchor((a) => shiftAnchor(a, viewMode, -1))}
              className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center hover:bg-sand-100"
              aria-label="上一段"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <span className="text-xs font-medium text-gray-700 min-w-0 flex-1 text-center truncate px-1">
              {formatPeriodLabel(anchor, viewMode)}
            </span>
            <button
              type="button"
              onClick={() => setAnchor((a) => shiftAnchor(a, viewMode, 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sand-100"
              aria-label="下一段"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {viewMode === 'week' && (
          <div className="calendar-grid-7 mb-3">
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
        )}

        {viewMode === 'month' && (
          <div className="mb-3">
            <div className="calendar-grid-7 mb-1">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label} className="text-[10px] text-center text-gray-400 py-1 min-w-0">
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
        )}

        {viewMode === 'year' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
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
                  <p className="text-xs font-medium text-gray-700">{monthStart.getMonth() + 1} 月</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {count > 0 ? `${count} 項待辦` : '無待辦'}
                  </p>
                  {count > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div className="border-t border-sand-200 pt-3">
          <p className="text-[10px] text-gray-400 mb-2">
            {toDateKey(selectedDay) === toDateKey(CALENDAR_TODAY) ? '今日' : toDateKey(selectedDay)}{' '}
            待辦
          </p>
          {selectedDayTodos.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">這天沒有待辦事項</p>
          ) : (
            <div className="space-y-2">
              {selectedDayTodos.map((todo) => (
                <button
                  key={todo.id}
                  type="button"
                  onClick={() => setSelectedTodo(todo)}
                  className="w-full m3-card p-3 text-left flex items-start gap-2 hover:bg-sand-50 active:bg-sand-100 transition-colors"
                >
                  <span
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${URGENCY_DOT[todo.urgency]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{todo.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {todo.memberName} · {URGENCY_LABELS[todo.urgency]}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <TodoDetailModal
        todo={selectedTodo}
        isOpen={!!selectedTodo}
        onOpenChange={(open) => !open && setSelectedTodo(null)}
        onViewAll={onViewAll}
      />
    </section>
  )
}