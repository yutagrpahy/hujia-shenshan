import { Button } from '@heroui/react'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  EVENT_TYPE_LABELS,
  FREQUENCY_LABELS,
  URGENCY_LABELS,
} from '../../data/mockData'
import {
  buildMemberPlanningItems,
  getTodoSourceChipClass,
  getTodoUrgencyChipClass,
  TODO_SOURCE_LABELS,
} from '../../data/todoLabels'
import { CardSectionTitle, StackList, TextModalLink } from '../common/CardLayout'
import { TodoListCard } from '../common/TodoListCard'
import { EventFormModal } from '../common/EventFormModal'
import { TodoCompleteConfirmModal } from '../common/TodoCompleteConfirmModal'
import { TodoDetailFlow } from '../common/TodoDetailFlow'
import { formatCurrency } from '../../utils/calculations'
import type { FamilyEvent, FamilyMember, NewEventInput, TodoItem } from '../../types'
import { EventDetailModal } from './EventDetailModal'
import { MemberCompletedEventsModal } from './MemberCompletedEventsModal'

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
  const { members: allMembers, updateFamilyEvent, completeFamilyEvent } = useApp()

  const memberHistory = historyTodos.filter((todo) => todo.memberId === member.id)
  const items = useMemo(() => buildMemberPlanningItems(todos, events), [todos, events])

  const [pendingCompleteEvent, setPendingCompleteEvent] = useState<FamilyEvent | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<TodoItem | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<FamilyEvent | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [eventFormInput, setEventFormInput] = useState<NewEventInput>(EMPTY_EVENT_INPUT)

  const handleConfirmCompleteEvent = () => {
    if (!pendingCompleteEvent) return
    completeFamilyEvent(pendingCompleteEvent.id)
    setPendingCompleteEvent(null)
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

  return (
    <section>
      <CardSectionTitle
        subtitle="待辦提醒與保障規劃事件"
        actions={
          <Button
            size="sm"
            variant="secondary"
            className="border-teal-200 text-teal-700 shrink-0"
            onPress={onAdd}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden />
            新增待辦
          </Button>
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
                tags={
                  <>
                    {item.data.dueDate ? (
                      <span className="text-[10px] text-gray-400">📅 {item.data.dueDate}</span>
                    ) : null}
                    <span className={`m3-chip shrink-0 ${getTodoUrgencyChipClass(item.data.urgency)}`}>
                      {URGENCY_LABELS[item.data.urgency]}
                    </span>
                    <span className={`m3-chip shrink-0 ${getTodoSourceChipClass()}`}>
                      {TODO_SOURCE_LABELS[item.data.source]}
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
                    <span className={`m3-chip shrink-0 ${getTodoUrgencyChipClass(item.data.urgency)}`}>
                      {URGENCY_LABELS[item.data.urgency]}
                    </span>
                    <span className={`m3-chip shrink-0 ${getTodoSourceChipClass()}`}>
                      {TODO_SOURCE_LABELS.event}
                    </span>
                  </>
                }
              />
            ),
          )}
        </StackList>
      )}

      <div className="member-todos-footer">
        <TextModalLink
          variant="secondary"
          onClick={() => setShowCompleted(true)}
          aria-label="查看已完成事件"
        >
          已完成事件
        </TextModalLink>
      </div>

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

      <TodoDetailFlow
        todo={selectedTodo}
        isOpen={!!selectedTodo}
        onOpenChange={(open) => !open && setSelectedTodo(null)}
        onCompleteTodo={onCompleteTodo}
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
        onComplete={
          selectedEvent
            ? () => {
                const event = selectedEvent
                setSelectedEvent(null)
                setPendingCompleteEvent(event)
              }
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

    </section>
  )
}