import { Button, Modal } from '@heroui/react'
import { Check, History } from 'lucide-react'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { URGENCY_LABELS } from '../../data/mockData'
import {
  StackList,
  CardItem,
  CardItemDetail,
  CardItemMain,
  CardItemRow,
  CardItemTitle,
} from '../common/CardLayout'
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
              <StackList>
                {items.map((todo) => (
                  <CardItem key={todo.id} className="opacity-80">
                    <CardItemRow>
                      <div className="m3-card-item__media">
                        <div className="m3-icon-wrap m3-icon-wrap--xs bg-teal-100">
                          <Check className="w-3.5 h-3.5 text-teal-600" />
                        </div>
                      </div>
                      <CardItemMain>
                        <CardItemTitle className="text-gray-600 line-through">
                          {todo.title}
                        </CardItemTitle>
                        <CardItemDetail className="flex items-center gap-2 mt-1">
                          <History className="w-3 h-3 text-gray-300 shrink-0" />
                          <span>
                            完成於 {todo.completedAt}
                            {todo.urgency ? ` · ${URGENCY_LABELS[todo.urgency]}` : ''}
                          </span>
                        </CardItemDetail>
                      </CardItemMain>
                    </CardItemRow>
                  </CardItem>
                ))}
              </StackList>
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