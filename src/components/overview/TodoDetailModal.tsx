import { Button, Modal } from '@heroui/react'
import { DetailEditLink, StackBlock, StackList } from '../common/CardLayout'
import { Calendar, Check, User } from 'lucide-react'
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
  onViewMember,
  onEdit,
  onComplete,
}: {
  todo: TodoItem | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onViewMember?: () => void
  onEdit?: () => void
  onComplete?: () => void
}) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'}>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Body>
            {todo && (
              <StackBlock>
                <div className="modal-detail-title-row">
                  <p className="modal-detail-title-row__heading">{todo.title}</p>
                  {onEdit ? <DetailEditLink onClick={onEdit} /> : null}
                </div>
                <StackList className="text-sm">
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
                </StackList>
                <div className="flex flex-wrap gap-2">
                  <span className={`m3-chip ${URGENCY_STYLES[todo.urgency]}`}>
                    {URGENCY_LABELS[todo.urgency]}
                  </span>
                  <span className="m3-chip m3-chip--muted">
                    {SOURCE_LABELS[todo.source]}
                  </span>
                </div>
              </StackBlock>
            )}
          </Modal.Body>
          <Modal.Footer>
            {onComplete ? (
              <>
                <Button slot="close" variant="secondary">
                  關閉
                </Button>
                <Button className="btn-accent" onPress={onComplete}>
                  <Check className="w-4 h-4" />
                  標示完成
                </Button>
              </>
            ) : onViewMember ? (
              <Button
                fullWidth
                className="btn-accent"
                onPress={() => {
                  onOpenChange(false)
                  onViewMember()
                }}
              >
                前往成員待辦
              </Button>
            ) : (
              <Button slot="close" fullWidth variant="secondary">
                關閉
              </Button>
            )}
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}