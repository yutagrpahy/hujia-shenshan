import { mergeTodos } from '../services/rulesEngine'
import type { FamilyEvent, TodoItem, TodoUrgency } from '../types'

/** 個人待辦來源標籤（僅兩種；不含緊急度與事件類型） */
export const TODO_SOURCE_DISPLAY = {
  system: '系統提醒',
  manual: '手動新增',
} as const

const ENGINE_SYSTEM_RULE_KINDS = new Set(['renewal', 'expired', 'pending', 'claim_docs', 'gap'])

/** 規則引擎產生的系統待辦（對齊保單標籤狀態與保障缺口） */
export function isEngineSystemTodo(todo: Pick<TodoItem, 'ruleId'>): boolean {
  if (!todo.ruleId) return false
  return ENGINE_SYSTEM_RULE_KINDS.has(todo.ruleId.split(':')[0])
}

export function getTodoSourceDisplayLabel(todo: Pick<TodoItem, 'ruleId' | 'source'>): string {
  return isEngineSystemTodo(todo) ? TODO_SOURCE_DISPLAY.system : TODO_SOURCE_DISPLAY.manual
}

function isPersistedTodoVisible(todo: TodoItem): boolean {
  if (todo.completed) return false
  if (todo.source === 'system' && !isEngineSystemTodo(todo)) return false
  return true
}

export function filterActivePersistedTodos(todos: TodoItem[]): TodoItem[] {
  return todos.filter(isPersistedTodoVisible)
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

/**
 * 成員有效待辦：系統產生（deriveSystemTodos，已排除有效保單與理賠進行中／已結案）
 * ＋ persisted 手動／事件待辦（未完成）。
 */
export function buildMemberActiveTodos(
  memberId: string,
  systemTodos: TodoItem[],
  persistedTodos: TodoItem[],
): TodoItem[] {
  const systemForMember = systemTodos.filter((todo) => todo.memberId === memberId)
  const persistedForMember = persistedTodos.filter(
    (todo) => todo.memberId === memberId && isPersistedTodoVisible(todo),
  )
  return mergeTodos(systemForMember, persistedForMember)
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
 * 1. 系統產生待辦（未達成保單／理賠／缺口狀態）
 * 2. 手動／事件 persisted 待辦（未完成）
 * 3. 尚未連結待辦的獨立規劃事件
 *
 * 不計入的系統狀態：有效保單、到期自動續保、投保中、理賠進行中／已結案、缺口達成率 >50% 等。
 */
export function countMemberReminders(
  memberId: string,
  systemTodos: TodoItem[],
  persistedTodos: TodoItem[],
  memberEvents: FamilyEvent[],
): { total: number; hasUrgent: boolean } {
  const memberTodos = buildMemberActiveTodos(memberId, systemTodos, persistedTodos)
  const planningItems = buildMemberPlanningItems(memberTodos, memberEvents)

  return {
    total: planningItems.length,
    hasUrgent: planningItems.some((item) => item.urgency === 'high'),
  }
}