import type { FamilyEvent, TodoItem, TodoUrgency } from '../types'

export const TODO_SOURCE_LABELS: Record<TodoItem['source'], string> = {
  system: '系統提醒',
  event: '保障規劃',
  manual: '手動新增',
}

const TODO_URGENCY_CHIP_CLASS: Record<TodoUrgency, string> = {
  high: 'todo-chip todo-chip--high',
  medium: 'todo-chip todo-chip--medium',
  low: 'todo-chip todo-chip--low',
}

export function getTodoUrgencyChipClass(urgency: TodoUrgency): string {
  return TODO_URGENCY_CHIP_CLASS[urgency]
}

export function getTodoSourceChipClass(): string {
  return 'todo-chip todo-chip--source'
}

export function getTodoCountChipClass(hasUrgent: boolean): string {
  return hasUrgent ? 'todo-chip todo-chip--high' : 'todo-chip todo-chip--medium'
}

export type MemberPlanningItem =
  | { kind: 'todo'; urgency: TodoUrgency; sortDate?: string; data: TodoItem }
  | { kind: 'event'; urgency: TodoUrgency; sortDate?: string; data: FamilyEvent }

const URGENCY_RANK: Record<TodoUrgency, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

/** 成員詳情：合併待辦與未連結事件的規劃項目 */
export function buildMemberPlanningItems(
  todos: TodoItem[],
  events: FamilyEvent[],
): MemberPlanningItem[] {
  const eventIdsWithTodo = new Set(
    todos.map((todo) => todo.eventId).filter((id): id is string => !!id),
  )
  const standaloneEvents = events.filter((event) => !eventIdsWithTodo.has(event.id))

  const items: MemberPlanningItem[] = [
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

/**
 * 家庭成員待辦數（與成員詳情「個人待辦」列表同一套邏輯）：
 * 1. 合併後的待辦（系統依保單／理賠／缺口產生 ＋ 手動／事件 persisted）
 * 2. 加上尚未連結待辦的獨立規劃事件
 */
export function countMemberReminders(
  memberTodos: TodoItem[],
  memberEvents: FamilyEvent[],
): { total: number; hasUrgent: boolean } {
  const planningItems = buildMemberPlanningItems(memberTodos, memberEvents)

  return {
    total: planningItems.length,
    hasUrgent: planningItems.some((item) => item.urgency === 'high'),
  }
}