import { Button, Modal } from '@heroui/react'
import { StackForm } from './CardLayout'
import { useEffect, useState } from 'react'
import { URGENCY_LABELS } from '../../data/mockData'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type { TodoItem, TodoUrgency, UpdateTodoInput } from '../../types'

export function TodoEditModal({
  todo,
  isOpen,
  onOpenChange,
  onSave,
}: {
  todo: TodoItem | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: UpdateTodoInput) => void
}) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const [form, setForm] = useState<UpdateTodoInput>({
    title: '',
    dueDate: '',
    urgency: 'medium',
  })

  useEffect(() => {
    if (!todo || !isOpen) return
    setForm({
      title: todo.title,
      dueDate: todo.dueDate ?? '',
      urgency: todo.urgency,
    })
  }, [isOpen, todo])

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({
      title: form.title.trim(),
      dueDate: form.dueDate || undefined,
      urgency: form.urgency,
    })
    onOpenChange(false)
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'}>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>編輯待辦</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <StackForm>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">標題 *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="m3-field"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">到期日（選填）</label>
                <input
                  type="date"
                  value={form.dueDate ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="m3-field"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">緊急程度</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as TodoUrgency[]).map((urgency) => (
                    <button
                      key={urgency}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, urgency }))}
                      className={`m3-chip m3-chip-btn ${
                        form.urgency === urgency ? 'm3-chip--selected' : 'm3-chip--muted'
                      }`}
                    >
                      {URGENCY_LABELS[urgency]}
                    </button>
                  ))}
                </div>
              </div>
            </StackForm>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              取消
            </Button>
            <Button className="btn-accent" onPress={handleSave}>
              儲存
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}