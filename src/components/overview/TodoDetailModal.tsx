import { Button, Modal } from '@heroui/react'
import { Calendar, ChevronRight, User } from 'lucide-react'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { URGENCY_LABELS } from '../../data/mockData'
import type { TodoItem } from '../../types'

const URGENCY_STYLES: Record<string, string> = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-gray-100 text-gray-500',
}

const SOURCE_LABELS: Record<TodoItem['source'], string> = {
  system: '系統提醒',
  event: '保障規劃',
  manual: '手動新增',
}

export function TodoDetailModal({
  todo,
  isOpen,
  onOpenChange,
  onViewAll,
}: {
  todo: TodoItem | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onViewAll: () => void
}) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'}>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>待辦詳情</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {todo && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-800 leading-relaxed">{todo.title}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-teal-500 shrink-0" />
                    <span>{todo.memberName}</span>
                  </div>
                  {todo.dueDate && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
                      <span>到期日 {todo.dueDate}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`m3-chip ${URGENCY_STYLES[todo.urgency]}`}>
                    {URGENCY_LABELS[todo.urgency]}
                  </span>
                  <span className="m3-chip bg-sand-100 text-gray-500">
                    {SOURCE_LABELS[todo.source]}
                  </span>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="flex flex-col gap-2">
            <Button
              fullWidth
              className="btn-accent"
              onPress={() => {
                onOpenChange(false)
                onViewAll()
              }}
            >
              前往提醒頁查看
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}