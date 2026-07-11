import { Button, Modal } from '@heroui/react'
import { FormLabel, StackForm } from './CardLayout'
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
            <Modal.Heading>{mode === 'edit' ? '編輯規劃事件' : '新增待辦'}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <StackForm>
              <div>
                <FormLabel>事件名稱 *</FormLabel>
                <input
                  value={eventInput.name}
                  onChange={(e) => setEventInput((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={EVENT_FORM_PLACEHOLDERS.name}
                  className="m3-field"
                />
              </div>
              <div>
                <FormLabel>事件類型（選填）</FormLabel>
                <select
                  value={eventInput.type ?? ''}
                  onChange={(e) =>
                    setEventInput((prev) => ({
                      ...prev,
                      type: (e.target.value || undefined) as EventType | undefined,
                    }))
                  }
                  className="m3-field"
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
                <FormLabel>事件日期（選填）</FormLabel>
                <input
                  type="date"
                  value={eventInput.date ?? ''}
                  onChange={(e) => setEventInput((prev) => ({ ...prev, date: e.target.value }))}
                  className="m3-field"
                />
              </div>
              <div>
                <FormLabel>事件頻率</FormLabel>
                <select
                  value={eventInput.frequency}
                  onChange={(e) =>
                    setEventInput((prev) => ({
                      ...prev,
                      frequency: e.target.value as EventFrequency,
                    }))
                  }
                  className="m3-field"
                >
                  {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FormLabel>所需資金</FormLabel>
                <input
                  type="number"
                  value={eventInput.fundsNeeded}
                  onChange={(e) =>
                    setEventInput((prev) => ({ ...prev, fundsNeeded: Number(e.target.value) }))
                  }
                  placeholder={EVENT_FORM_PLACEHOLDERS.fundsNeeded}
                  className="m3-field"
                />
              </div>
              <div>
                <FormLabel>緊急程度</FormLabel>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as TodoUrgency[]).map((urgency) => (
                    <button
                      key={urgency}
                      type="button"
                      onClick={() => setEventInput((prev) => ({ ...prev, urgency }))}
                      className={`m3-chip m3-chip-btn ${
                        eventInput.urgency === urgency ? 'm3-chip--selected' : 'm3-chip--muted'
                      }`}
                    >
                      {URGENCY_LABELS[urgency]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <FormLabel>事件描述（選填）</FormLabel>
                <textarea
                  value={eventInput.description ?? ''}
                  onChange={(e) =>
                    setEventInput((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={EVENT_FORM_PLACEHOLDERS.description}
                  rows={3}
                  className="m3-field resize-none"
                />
              </div>
              <div>
                <FormLabel>關聯成員</FormLabel>
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
                      className={`m3-chip ${
                        eventInput.memberIds.includes(member.id)
                          ? 'm3-chip--selected'
                          : 'm3-chip--muted'
                      }`}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>
            </StackForm>
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