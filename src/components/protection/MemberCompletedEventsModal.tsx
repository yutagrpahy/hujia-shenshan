import { Button, Modal } from '@heroui/react'
import { Check, History } from 'lucide-react'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { URGENCY_LABELS } from '../../data/mockData'
import type { TodoItem } from '../../types'

export function MemberCompletedEventsModal({
  items,
  memberName,
  isOpen,
  onOpenChange,
}: {
  items: TodoItem[]
  memberName: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{memberName} · 已完成事件</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {items.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">尚無已完成事項</p>
            ) : (
              <div className="space-y-2">
                {items.map((todo) => (
                  <div key={todo.id} className="m3-card p-3.5 flex items-start gap-3 opacity-80">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 line-through">{todo.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <History className="w-3 h-3 text-gray-300" />
                        <span className="text-[10px] text-gray-400">
                          完成於 {todo.completedAt}
                          {todo.urgency ? ` · ${URGENCY_LABELS[todo.urgency]}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" fullWidth variant="secondary">
              關閉
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}