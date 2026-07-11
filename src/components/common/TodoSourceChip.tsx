import {
  getTodoSourceChipClass,
  getTodoSourceDisplayLabel,
  TODO_SOURCE_DISPLAY,
} from '../../data/todoLabels'
import type { TodoItem } from '../../types'

/** 個人待辦來源標籤：僅「系統提醒」或「手動新增」 */
export function TodoSourceChip({
  todo,
}: {
  todo?: Pick<TodoItem, 'ruleId' | 'source'>
}) {
  const label = todo ? getTodoSourceDisplayLabel(todo) : TODO_SOURCE_DISPLAY.manual

  return (
    <span className={`m3-chip shrink-0 ${getTodoSourceChipClass()}`}>{label}</span>
  )
}