import { Button, Modal } from '@heroui/react'
import { FormLabel, StackForm } from '../common/CardLayout'
import { useEffect, useState } from 'react'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type { FamilyMember, UpdateMemberProfileInput } from '../../types'

export function EditProfileModal({
  member,
  isOpen,
  onOpenChange,
  onSave,
}: {
  member: FamilyMember
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: UpdateMemberProfileInput) => void
}) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const [form, setForm] = useState<UpdateMemberProfileInput>({
    name: member.name,
    age: member.age,
    occupation: member.occupation,
    phone: member.phone,
    email: member.email,
    monthlyIncome: member.monthlyIncome,
    monthlyExpense: member.monthlyExpense,
  })

  useEffect(() => {
    if (!isOpen) return
    setForm({
      name: member.name,
      age: member.age,
      occupation: member.occupation,
      phone: member.phone,
      email: member.email,
      monthlyIncome: member.monthlyIncome,
      monthlyExpense: member.monthlyExpense,
    })
  }, [isOpen, member])

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave(form)
    onOpenChange(false)
  }

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>編輯基本資料</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <StackForm>
              {[
                { key: 'name', label: '姓名', type: 'text' },
                { key: 'age', label: '年齡', type: 'number' },
                { key: 'occupation', label: '職業', type: 'text' },
                { key: 'phone', label: '電話', type: 'tel' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'monthlyIncome', label: '月收入', type: 'number' },
                { key: 'monthlyExpense', label: '月支出', type: 'number' },
              ].map((field) => (
                <div key={field.key}>
                  <FormLabel>{field.label}</FormLabel>
                  <input
                    type={field.type}
                    value={form[field.key as keyof UpdateMemberProfileInput]}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [field.key]:
                          field.type === 'number' ? Number(e.target.value) : e.target.value,
                      }))
                    }
                    className="m3-field"
                  />
                </div>
              ))}
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