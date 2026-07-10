import { Button, Modal } from '@heroui/react'
import {
  EVENT_FORM_PLACEHOLDERS,
  EVENT_TYPE_LABELS,
  FREQUENCY_LABELS,
  URGENCY_LABELS,
} from '../../data/mockData'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type { EventFrequency, EventType, FamilyMember, NewEventInput, TodoUrgency } from '../../types'

export function EventFormModal({
  isOpen,
  onOpenChange,
  members,
  eventInput,
  setEventInput,
  onSubmit,
  mode = 'create',
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  members: FamilyMember[]
  eventInput: NewEventInput
  setEventInput: React.Dispatch<React.SetStateAction<NewEventInput>>
  onSubmit: () => void
  mode?: 'create' | 'edit'
}) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{mode === 'edit' ? '編輯規劃事件' : '新增待辦事項'}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">事件名稱 *</label>
                <input
                  value={eventInput.name}
                  onChange={(e) => setEventInput((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={EVENT_FORM_PLACEHOLDERS.name}
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">事件類型（選填）</label>
                <select
                  value={eventInput.type ?? ''}
                  onChange={(e) =>
                    setEventInput((prev) => ({
                      ...prev,
                      type: (e.target.value || undefined) as EventType | undefined,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm"
                >
                  <option value="">不指定</option>
                  {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">事件日期（選填）</label>
                <input
                  type="date"
                  value={eventInput.date ?? ''}
                  onChange={(e) => setEventInput((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">事件頻率</label>
                <select
                  value={eventInput.frequency}
                  onChange={(e) =>
                    setEventInput((prev) => ({
                      ...prev,
                      frequency: e.target.value as EventFrequency,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm"
                >
                  {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">所需資金</label>
                <input
                  type="number"
                  value={eventInput.fundsNeeded}
                  onChange={(e) =>
                    setEventInput((prev) => ({ ...prev, fundsNeeded: Number(e.target.value) }))
                  }
                  placeholder={EVENT_FORM_PLACEHOLDERS.fundsNeeded}
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">緊急程度</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as TodoUrgency[]).map((urgency) => (
                    <button
                      key={urgency}
                      type="button"
                      onClick={() => setEventInput((prev) => ({ ...prev, urgency }))}
                      className={`m3-chip flex-1 py-2 text-center ${
                        eventInput.urgency === urgency
                          ? 'bg-teal-500 text-white'
                          : 'bg-sand-100 text-gray-600'
                      }`}
                    >
                      {URGENCY_LABELS[urgency]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">事件描述（選填）</label>
                <textarea
                  value={eventInput.description ?? ''}
                  onChange={(e) =>
                    setEventInput((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={EVENT_FORM_PLACEHOLDERS.description}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm resize-none placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">關聯成員</label>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        const memberIds = eventInput.memberIds.includes(member.id)
                          ? eventInput.memberIds.filter((id) => id !== member.id)
                          : [...eventInput.memberIds, member.id]
                        setEventInput((prev) => ({ ...prev, memberIds }))
                      }}
                      className={`m3-chip px-3 py-1.5 ${
                        eventInput.memberIds.includes(member.id)
                          ? 'bg-teal-500 text-white'
                          : 'bg-sand-100 text-gray-600'
                      }`}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth className="btn-accent" onPress={onSubmit}>
              {mode === 'edit' ? '儲存變更' : '確認新增'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}