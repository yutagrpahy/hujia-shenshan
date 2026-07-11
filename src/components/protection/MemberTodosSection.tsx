import { Button } from '@heroui/react'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  EVENT_TYPE_LABELS,
  FREQUENCY_LABELS,
  URGENCY_LABELS,
} from '../../data/mockData'
import { CardSectionTitle, StackList, TextModalLink } from '../common/CardLayout'
import { TodoCompleteButton, TodoListCard } from '../common/TodoListCard'
import { EventFormModal } from '../common/EventFormModal'
import { TodoCompleteConfirmModal } from '../common/TodoCompleteConfirmModal'
import { TodoEditModal } from '../common/TodoEditModal'
import { TodoDetailModal } from '../overview/TodoDetailModal'
import { formatCurrency } from '../../utils/calculations'
import type { FamilyEvent, FamilyMember, NewEventInput, TodoItem, TodoUrgency } from '../../types'
import { EventDetailModal } from './EventDetailModal'
import { MemberCompletedEventsModal } from './MemberCompletedEventsModal'

const URGENCY_RANK: Record<TodoUrgency, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const URGENCY_STYLES = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-sand-100 text-gray-500',
}

const SOURCE_LABELS: Record<TodoItem['source'], string> = {
  system: '系統提醒',
  event: '保障規劃',
  manual: '手動新增',
}

const EMPTY_EVENT_INPUT: NewEventInput = {
  name: '',
  type: undefined,
  date: '',
  frequency: 'once',
  fundsNeeded: 0,
  urgency: 'medium',
  description: '',
  memberIds: [],
}

type PlanningItem =
  | { kind: 'todo'; urgency: TodoUrgency; sortDate?: string; data: TodoItem }
  | { kind: 'event'; urgency: TodoUrgency; sortDate?: string; data: FamilyEvent }

function buildPlanningItems(todos: TodoItem[], events: FamilyEvent[]): PlanningItem[] {
  const eventIdsWithTodo = new Set(
    todos.map((todo) => todo.eventId).filter((id): id is string => !!id),
  )
  const standaloneEvents = events.filter((event) => !eventIdsWithTodo.has(event.id))

  const items: PlanningItem[] = [
    ...todos.map((todo) => ({
      kind: 'todo' as const,
      urgency: todo.urgency,
      sortDate: todo.dueDate,
      data: todo,
    })),
    ...standaloneEvents.map((event) => ({
      kind: 'event' as const,
      urgency: event.urgency,
      sortDate: event.date,
      data: event,
    })),
  ]

  return items.sort((a, b) => {
    const urgencyDiff = URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency]
    if (urgencyDiff !== 0) return urgencyDiff
    if (a.sortDate && b.sortDate) return a.sortDate.localeCompare(b.sortDate)
    if (a.sortDate) return -1
    if (b.sortDate) return 1
    const titleA = a.kind === 'todo' ? a.data.title : a.data.name
    const titleB = b.kind === 'todo' ? b.data.title : b.data.name
    return titleA.localeCompare(titleB, 'zh-TW')
  })
}

function eventToInput(event: FamilyEvent): NewEventInput {
  return {
    name: event.name,
    type: event.type,
    date: event.date,
    frequency: event.frequency,
    fundsNeeded: event.fundsNeeded,
    urgency: event.urgency,
    description: event.description,
    memberIds: event.memberIds,
  }
}

export function MemberTodosSection({
  member,
  todos,
  historyTodos,
  events,
  onAdd,
  onCompleteTodo,
}: {
  member: FamilyMember
  members?: FamilyMember[]
  todos: TodoItem[]
  historyTodos: TodoItem[]
  events: FamilyEvent[]
  onAdd: () => void
  onCompleteTodo: (id: string) => void
}) {
  const {
    members: allMembers,
    familyEvents,
    updateFamilyEvent,
    updateTodo,
    completeFamilyEvent,
  } = useApp()

  const memberHistory = historyTodos.filter((todo) => todo.memberId === member.id)
  const items = useMemo(() => buildPlanningItems(todos, events), [todos, events])

  const [pendingCompleteTodo, setPendingCompleteTodo] = useState<TodoItem | null>(null)
  const [pendingCompleteEvent, setPendingCompleteEvent] = useState<FamilyEvent | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<FamilyEvent | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null)
  const [eventFormInput, setEventFormInput] = useState<NewEventInput>(EMPTY_EVENT_INPUT)

  const handleConfirmCompleteTodo = () => {
    if (!pendingCompleteTodo) return
    onCompleteTodo(pendingCompleteTodo.id)
    setPendingCompleteTodo(null)
  }

  const handleConfirmCompleteEvent = () => {
    if (!pendingCompleteEvent) return
    completeFamilyEvent(pendingCompleteEvent.id)
    setPendingCompleteEvent(null)
  }

  const openEditForTodo = (todo: TodoItem) => {
    setSelectedTodo(null)
    if (todo.eventId) {
      const event = familyEvents.find((item) => item.id === todo.eventId)
      if (!event) return
      setEditingEventId(event.id)
      setEventFormInput(eventToInput(event))
      return
    }
    setEditingTodo(todo)
  }

  const openEditForEvent = (event: FamilyEvent) => {
    setSelectedEvent(null)
    setEditingEventId(event.id)
    setEventFormInput(eventToInput(event))
  }

  const handleSaveEvent = () => {
    if (!editingEventId || !eventFormInput.name.trim()) return
    updateFamilyEvent(editingEventId, eventFormInput)
    setEditingEventId(null)
    setEventFormInput(EMPTY_EVENT_INPUT)
  }

  const handleSaveTodo = (input: Parameters<typeof updateTodo>[1]) => {
    if (!editingTodo) return
    updateTodo(editingTodo.id, input)
    setEditingTodo(null)
  }

  return (
    <section>
      <CardSectionTitle
        subtitle="待辦提醒與保障規劃事件"
        actions={
          <div className="flex items-center gap-3 shrink-0">
          <TextModalLink
            onClick={() => setShowCompleted(true)}
            aria-label="查看已完成事件"
          >
            已完成事件
          </TextModalLink>
          <Button
            size="sm"
            variant="secondary"
            className="border-teal-200 text-teal-700 shrink-0"
            onPress={onAdd}
          >
            <Plus className="w-3.5 h-3.5" />
            新增
          </Button>
          </div>
        }
      >
        個人待辦
      </CardSectionTitle>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 m3-card p-4 bg-sand-50/80">尚無待辦或規劃事件</p>
      ) : (
        <StackList>
          {items.map((item) =>
            item.kind === 'todo' ? (
              <TodoListCard
                key={`todo-${item.data.id}`}
                title={item.data.title}
                onClick={() => setSelectedTodo(item.data)}
                leading={
                  <TodoCompleteButton
                    onClick={() => setPendingCompleteTodo(item.data)}
                    label="標記完成"
                  />
                }
                tags={
                  <>
                    {item.data.dueDate ? (
                      <span className="text-[10px] text-gray-400">📅 {item.data.dueDate}</span>
                    ) : null}
                    <span className={`m3-chip ${URGENCY_STYLES[item.data.urgency]}`}>
                      {URGENCY_LABELS[item.data.urgency]}
                    </span>
                    <span className="m3-chip m3-chip--muted border border-sand-200 bg-white">
                      {SOURCE_LABELS[item.data.source]}
                    </span>
                  </>
                }
              />
            ) : (
              <TodoListCard
                key={`event-${item.data.id}`}
                title={item.data.name}
                detail={item.data.description}
                onClick={() => setSelectedEvent(item.data)}
                leading={
                  <TodoCompleteButton
                    onClick={() => setPendingCompleteEvent(item.data)}
                    label="標記完成"
                  />
                }
                tags={
                  <>
                    {item.data.type ? (
                      <span className="m3-chip bg-teal-50 text-teal-600">
                        {EVENT_TYPE_LABELS[item.data.type]}
                      </span>
                    ) : null}
                    {item.data.date ? (
                      <span className="text-[10px] text-gray-400">📅 {item.data.date}</span>
                    ) : null}
                    <span className="text-[10px] text-gray-400">
                      🔄 {FREQUENCY_LABELS[item.data.frequency]}
                    </span>
                    {item.data.fundsNeeded > 0 ? (
                      <span className="text-[10px] text-gray-400">
                        💰 {formatCurrency(item.data.fundsNeeded)}
                      </span>
                    ) : null}
                    <span className={`m3-chip ${URGENCY_STYLES[item.data.urgency]}`}>
                      {URGENCY_LABELS[item.data.urgency]}
                    </span>
                  </>
                }
              />
            ),
          )}
        </StackList>
      )}

      <TodoCompleteConfirmModal
        todo={pendingCompleteTodo}
        isOpen={!!pendingCompleteTodo}
        onOpenChange={(open) => !open && setPendingCompleteTodo(null)}
        onConfirm={handleConfirmCompleteTodo}
      />

      <TodoCompleteConfirmModal
        todo={
          pendingCompleteEvent
            ? {
                id: pendingCompleteEvent.id,
                title: pendingCompleteEvent.name,
                memberId: member.id,
                memberName: member.name,
                urgency: pendingCompleteEvent.urgency,
                dueDate: pendingCompleteEvent.date,
                completed: false,
                source: 'event',
              }
            : null
        }
        heading="確認完成規劃事件？"
        description="完成後將移至已完成事件，並通知相關家人。確定要標記以下事項為已完成嗎？"
        isOpen={!!pendingCompleteEvent}
        onOpenChange={(open) => !open && setPendingCompleteEvent(null)}
        onConfirm={handleConfirmCompleteEvent}
      />

      <TodoDetailModal
        todo={selectedTodo}
        isOpen={!!selectedTodo}
        onOpenChange={(open) => !open && setSelectedTodo(null)}
        onEdit={
          selectedTodo
            ? () => openEditForTodo(selectedTodo)
            : undefined
        }
      />

      <EventDetailModal
        event={selectedEvent}
        members={allMembers}
        isOpen={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        onEdit={
          selectedEvent
            ? () => openEditForEvent(selectedEvent)
            : undefined
        }
      />

      <MemberCompletedEventsModal
        items={memberHistory}
        memberName={member.name}
        isOpen={showCompleted}
        onOpenChange={setShowCompleted}
      />

      <EventFormModal
        isOpen={!!editingEventId}
        onOpenChange={(open) => {
          if (!open) {
            setEditingEventId(null)
            setEventFormInput(EMPTY_EVENT_INPUT)
          }
        }}
        members={allMembers}
        eventInput={eventFormInput}
        setEventInput={setEventFormInput}
        onSubmit={handleSaveEvent}
        mode="edit"
      />

      <TodoEditModal
        todo={editingTodo}
        isOpen={!!editingTodo}
        onOpenChange={(open) => !open && setEditingTodo(null)}
        onSave={handleSaveTodo}
      />
    </section>
  )
}