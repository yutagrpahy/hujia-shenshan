import { Button, Modal } from '@heroui/react'
import { StackForm } from './CardLayout'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { URGENCY_LABELS } from '../../data/mockData'
import type { TodoItem } from '../../types'

const URGENCY_STYLES = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-sand-100 text-gray-500',
}

export function TodoCompleteConfirmModal({
  todo,
  isOpen,
  onOpenChange,
  onConfirm,
  heading = '確認完成待辦？',
  description = '完成後將移至已完成事件，並通知相關家人。確定要標記以下事項為已完成嗎？',
}: {
  todo: TodoItem | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  heading?: string
  description?: string
}) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'}>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{heading}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {todo && (
              <StackForm>
                <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                <div className="m3-card-filled p-3.5">
                  <p className="text-sm font-medium text-gray-800">{todo.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`m3-chip ${URGENCY_STYLES[todo.urgency]}`}>
                      {URGENCY_LABELS[todo.urgency]}
                    </span>
                    {todo.dueDate && (
                      <span className="text-[10px] text-gray-400">{todo.dueDate}</span>
                    )}
                  </div>
                </div>
              </StackForm>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              取消
            </Button>
            <Button className="btn-accent" onPress={onConfirm}>
              確認完成
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}