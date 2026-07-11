import {
  countMemberPolicyClaimStatusReminders,
  mergeTodos,
} from '../services/rulesEngine'
import type { FamilyEvent, FamilyMember, TodoItem, TodoUrgency } from '../types'

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
 * 家庭成員名單待辦數：
 * 保單申請／有效性與理賠狀態（系統）＋保障缺口提醒＋自行新增待辦＋獨立規劃事件
 */
export function countMemberReminders(
  memberId: string,
  members: FamilyMember[],
  systemTodos: TodoItem[],
  persistedTodos: TodoItem[],
  events: FamilyEvent[],
  dismissedRuleIds: ReadonlySet<string>,
): { total: number; hasUrgent: boolean } {
  const { count: statusCount, hasUrgent: statusUrgent } =
    countMemberPolicyClaimStatusReminders(memberId, members, dismissedRuleIds)

  const gapCount = systemTodos.filter(
    (todo) => todo.memberId === memberId && todo.ruleId?.startsWith('gap:'),
  ).length
  const gapUrgent = systemTodos.some(
    (todo) =>
      todo.memberId === memberId &&
      todo.ruleId?.startsWith('gap:') &&
      todo.urgency === 'high',
  )

  const persistedForMember = persistedTodos.filter((todo) => todo.memberId === memberId)
  const mergedMemberTodos = mergeTodos(systemTodos, persistedTodos).filter(
    (todo) => todo.memberId === memberId,
  )
  const eventIdsWithTodo = new Set(
    mergedMemberTodos
      .map((todo) => todo.eventId)
      .filter((id): id is string => !!id),
  )
  const standaloneEvents = events.filter(
    (event) =>
      event.memberIds.includes(memberId) && !eventIdsWithTodo.has(event.id),
  )

  const total =
    statusCount + gapCount + persistedForMember.length + standaloneEvents.length

  const hasUrgent =
    statusUrgent ||
    gapUrgent ||
    persistedForMember.some((todo) => todo.urgency === 'high') ||
    standaloneEvents.some((event) => event.urgency === 'high')

  return { total, hasUrgent }
}

/** 成員詳情待辦列表項目數（與名單計數邏輯對齊） */
export function countMemberPlanningItems(
  memberId: string,
  members: FamilyMember[],
  systemTodos: TodoItem[],
  persistedTodos: TodoItem[],
  events: FamilyEvent[],
  dismissedRuleIds: ReadonlySet<string>,
): number {
  return countMemberReminders(
    memberId,
    members,
    systemTodos,
    persistedTodos,
    events,
    dismissedRuleIds,
  ).total
}