import { Button, Modal } from '@heroui/react'
import { StackBlock, StackList } from '../common/CardLayout'
import { Calendar, Pencil, RefreshCw, Users } from 'lucide-react'
import {
  EVENT_TYPE_LABELS,
  FREQUENCY_LABELS,
  URGENCY_LABELS,
} from '../../data/mockData'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { formatCurrency } from '../../utils/calculations'
import type { FamilyEvent, FamilyMember } from '../../types'

const URGENCY_STYLES = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-sand-100 text-gray-500',
}

export function EventDetailModal({
  event,
  members,
  isOpen,
  onOpenChange,
  onEdit,
}: {
  event: FamilyEvent | null
  members: FamilyMember[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
}) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const linkedMembers = event
    ? members.filter((member) => event.memberIds.includes(member.id))
    : []

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'}>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>規劃事件詳情</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {event && (
              <StackBlock>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed">{event.name}</p>
                {event.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                )}
                <StackList className="text-sm text-gray-600">
                  {event.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
                      <span>事件日期 {event.date}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-teal-500 shrink-0" />
                    <span>{FREQUENCY_LABELS[event.frequency]}</span>
                  </div>
                  {event.fundsNeeded > 0 && (
                    <p>所需資金 {formatCurrency(event.fundsNeeded)}</p>
                  )}
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>{linkedMembers.map((member) => member.name).join('、') || '—'}</span>
                  </div>
                </StackList>
                <div className="flex flex-wrap gap-2">
                  {event.type && (
                    <span className="m3-chip bg-teal-50 text-teal-600">
                      {EVENT_TYPE_LABELS[event.type]}
                    </span>
                  )}
                  <span className={`m3-chip ${URGENCY_STYLES[event.urgency]}`}>
                    {URGENCY_LABELS[event.urgency]}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">建立者：{event.createdBy}</p>
              </StackBlock>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              關閉
            </Button>
            {onEdit && (
              <Button variant="secondary" className="border-teal-200 text-teal-700" onPress={onEdit}>
                <Pencil className="w-3.5 h-3.5" />
                編輯
              </Button>
            )}
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}