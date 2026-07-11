import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { FamilyEvent, NewEventInput, TodoItem } from '../../types'
import { EventFormModal } from './EventFormModal'
import { TodoCompleteConfirmModal } from './TodoCompleteConfirmModal'
import { TodoEditModal } from './TodoEditModal'
import { TodoDetailModal } from '../overview/TodoDetailModal'

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

/** 待辦詳情、編輯、標示完成 — 總覽日曆與成員個人待辦共用 */
export function TodoDetailFlow({
  todo,
  isOpen,
  onOpenChange,
  onCompleteTodo,
}: {
  todo: TodoItem | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCompleteTodo: (id: string) => void
}) {
  const { members, familyEvents, updateFamilyEvent, updateTodo } = useApp()
  const [pendingCompleteTodo, setPendingCompleteTodo] = useState<TodoItem | null>(null)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null)
  const [eventFormInput, setEventFormInput] = useState<NewEventInput>(EMPTY_EVENT_INPUT)

  const openEditForTodo = (item: TodoItem) => {
    onOpenChange(false)
    if (item.eventId) {
      const event = familyEvents.find((entry) => entry.id === item.eventId)
      if (!event) return
      setEditingEventId(event.id)
      setEventFormInput(eventToInput(event))
      return
    }
    setEditingTodo(item)
  }

  const handleConfirmComplete = () => {
    if (!pendingCompleteTodo) return
    onCompleteTodo(pendingCompleteTodo.id)
    setPendingCompleteTodo(null)
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
    <>
      <TodoDetailModal
        todo={todo}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onEdit={todo ? () => openEditForTodo(todo) : undefined}
        onComplete={
          todo
            ? () => {
                onOpenChange(false)
                setPendingCompleteTodo(todo)
              }
            : undefined
        }
      />

      <TodoCompleteConfirmModal
        todo={pendingCompleteTodo}
        isOpen={!!pendingCompleteTodo}
        onOpenChange={(open) => !open && setPendingCompleteTodo(null)}
        onConfirm={handleConfirmComplete}
      />

      <EventFormModal
        isOpen={!!editingEventId}
        onOpenChange={(open) => {
          if (!open) {
            setEditingEventId(null)
            setEventFormInput(EMPTY_EVENT_INPUT)
          }
        }}
        members={members}
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
    </>
  )
}