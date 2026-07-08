import { Button, Modal } from '@heroui/react'
import {
  ChevronRight,
  Link2,
  PenLine,
  Plus,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  EVENT_FORM_PLACEHOLDERS,
  EVENT_TYPE_LABELS,
  FREQUENCY_LABELS,
  ROLE_LABELS,
  STAGE_LABELS,
  URGENCY_LABELS,
} from '../../data/mockData'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { DocumentVault } from '../common/DocumentVault'
import { MemberAvatar } from '../common/MemberAvatar'
import { SuccessBanner } from '../common/StateViews'
import { countMemberPolicies, formatCurrency } from '../../utils/calculations'
import { AllPoliciesPanel } from './AllPoliciesPanel'
import type {
  EventFrequency,
  EventType,
  FamilyMember,
  MemberRole,
  NewEventInput,
  NewMemberInput,
  NewPolicyInput,
  Policy,
  TodoUrgency,
} from '../../types'

const POLICY_TYPE_LABELS: Record<Policy['type'], string> = {
  life: '壽險',
  health: '醫療',
  accident: '意外',
  longterm: '長照',
  savings: '年金',
  disability: '失能',
  critical: '重大疾病',
}

type ProtectionSubTab = 'members' | 'policies'

function SegmentTab({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`m3-segment-btn w-full ${active ? 'active' : ''}`}
    >
      {label}
    </button>
  )
}

const EMPTY_POLICY_INPUT: NewPolicyInput = {
  name: '',
  insurer: '',
  type: 'life',
  beneficiary: '本人',
  expiryDate: '',
  coverage: 0,
}

export function ProtectionPage() {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const {
    members,
    todos,
    familyEvents,
    documents,
    currentUserId,
    addMember,
    addManualPolicy,
    addFamilyEvent,
    selectedMemberId,
    setSelectedMemberId,
    uiState,
  } = useApp()

  const [subTab, setSubTab] = useState<ProtectionSubTab>('members')
  const [showAddMember, setShowAddMember] = useState(false)
  const totalPolicies = countMemberPolicies(members)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showAddPolicy, setShowAddPolicy] = useState(false)
  const [newPolicy, setNewPolicy] = useState<NewPolicyInput>(EMPTY_POLICY_INPUT)
  const [newMember, setNewMember] = useState<NewMemberInput>({
    name: '',
    age: 30,
    role: 'child',
    phone: '',
    email: '',
    occupation: '',
  })
  const [newEvent, setNewEvent] = useState<NewEventInput>({
    name: '',
    type: undefined,
    date: '',
    frequency: 'once',
    fundsNeeded: 0,
    urgency: 'medium',
    description: '',
    memberIds: [currentUserId],
  })

  const selectedMember = selectedMemberId
    ? members.find((m) => m.id === selectedMemberId)
    : null

  const handleAddMember = () => {
    if (!newMember.name.trim()) return
    addMember(newMember)
    setShowAddMember(false)
    setNewMember({ name: '', age: 30, role: 'child', phone: '', email: '', occupation: '' })
  }

  const handleAddEvent = () => {
    if (!newEvent.name.trim()) return
    addFamilyEvent(newEvent)
    setShowAddEvent(false)
    setNewEvent({
      name: '',
      type: undefined,
      date: '',
      frequency: 'once',
      fundsNeeded: 0,
      urgency: 'medium',
      description: '',
      memberIds: selectedMemberId ? [selectedMemberId] : [currentUserId],
    })
  }

  const openAddEventForMember = (memberId: string) => {
    setNewEvent((prev) => ({ ...prev, memberIds: [memberId] }))
    setShowAddEvent(true)
  }

  const handleAddPolicy = () => {
    if (!selectedMemberId || !newPolicy.name.trim() || !newPolicy.insurer.trim()) return
    addManualPolicy(selectedMemberId, newPolicy)
    setShowAddPolicy(false)
    setNewPolicy(EMPTY_POLICY_INPUT)
  }

  if (selectedMember) {
    const memberTodos = todos.filter((t) => t.memberId === selectedMember.id)
    const memberDocs = documents.filter((d) => d.ownerMemberId === selectedMember.id)
    const memberEvents = familyEvents.filter((e) => e.memberIds.includes(selectedMember.id))
    const isSelf = selectedMember.id === currentUserId
    const hasUnionPolicies = selectedMember.policies.some((p) => p.source === 'union')

    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedMemberId(null)}
          className="text-sm text-teal-600 font-medium"
        >
          ← 返回保障成員
        </button>

        <div className="m3-card-warm p-4 flex items-center gap-4">
          <MemberAvatar
            name={selectedMember.name}
            seed={selectedMember.avatarSeed}
            size="lg"
          />
          <div>
            <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
            <p className="text-xs text-gray-400">
              {selectedMember.age} 歲 · {ROLE_LABELS[selectedMember.role]} ·{' '}
              {STAGE_LABELS[selectedMember.lifeStage]}
            </p>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase">擁有保單</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">集保同步與自行登載保單</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="border-teal-200 text-teal-700 shrink-0"
              onPress={() => setShowAddPolicy(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              新增
            </Button>
          </div>

          {hasUnionPolicies && (
            <div className="flex items-start gap-2 p-2.5 mb-2 rounded-xl bg-teal-50/70 border border-teal-100">
              <Link2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-teal-700 leading-relaxed">
                標示「集保同步」的保單資料串聯保險工會集保，為成員本人登入後自動取得
              </p>
            </div>
          )}

          {selectedMember.policies.length === 0 ? (
            <p className="text-sm text-gray-400 m3-card p-4">尚無保單，可點「新增」自行登載</p>
          ) : (
            selectedMember.policies.map((p) => (
              <div
                key={p.id}
                className={`m3-card p-3 mb-2 ${
                  p.source === 'manual' ? 'border border-dashed border-sand-300 bg-sand-50/40' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-sm font-medium block truncate">{p.name}</span>
                    <span className="text-[10px] text-gray-400">{p.insurer}</span>
                  </div>
                  <span className="m3-chip bg-teal-50 text-teal-600 shrink-0">
                    {POLICY_TYPE_LABELS[p.type]}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  受益人：{p.beneficiary} · 到期 {p.expiryDate}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {p.source === 'union' ? (
                    <span className="m3-chip bg-teal-50 text-teal-600 inline-flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      集保同步
                    </span>
                  ) : (
                    <span className="m3-chip bg-sand-100 text-gray-600 inline-flex items-center gap-1 border border-dashed border-sand-300">
                      <PenLine className="w-3 h-3" />
                      自行登載
                    </span>
                  )}
                  {p.status === 'expiring' && (
                    <span className="m3-chip bg-amber-50 text-amber-600">即將到期</span>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        <section>
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">個人待辦</h4>
          {memberTodos.length === 0 ? (
            <p className="text-sm text-gray-400 m3-card p-4">無待辦事項</p>
          ) : (
            memberTodos.map((t) => (
              <div key={t.id} className="m3-card p-3 mb-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                <span className="text-sm">{t.title}</span>
              </div>
            ))
          )}
        </section>

        <DocumentVault
          documents={memberDocs}
          canUpload={isSelf}
          title={`${selectedMember.name} 的安全文件庫`}
        />

        <section className="planning-future-section">
          <div className="planning-future-divider" />
          <div className="flex items-center justify-between mb-1 mt-5">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase">保障規劃</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">規劃未來人生事件與保障需求</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="border-teal-200 text-teal-700 shrink-0"
              onPress={() => openAddEventForMember(selectedMember.id)}
            >
              <Plus className="w-3.5 h-3.5" />
              新增
            </Button>
          </div>
          {memberEvents.length === 0 ? (
            <p className="text-sm text-gray-400 m3-card p-4 bg-sand-50/80">尚無保障規劃事件</p>
          ) : (
            memberEvents.map((event) => (
              <div key={event.id} className="m3-card p-4 mb-2 bg-sand-50/50">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-700">{event.name}</p>
                  {event.type && (
                    <span className="m3-chip bg-teal-50 text-teal-600">
                      {EVENT_TYPE_LABELS[event.type]}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-xs text-gray-500 mb-2">{event.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-[10px] text-gray-400">
                  {event.date && <span>📅 {event.date}</span>}
                  <span>🔄 {FREQUENCY_LABELS[event.frequency]}</span>
                  {event.fundsNeeded > 0 && (
                    <span>💰 {formatCurrency(event.fundsNeeded)}</span>
                  )}
                  <span className={`m3-chip ${
                    event.urgency === 'high'
                      ? 'bg-red-50 text-red-600'
                      : event.urgency === 'medium'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-sand-100 text-gray-500'
                  }`}>
                    {URGENCY_LABELS[event.urgency]}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>

        <AddEventModal
          isOpen={showAddEvent}
          onOpenChange={setShowAddEvent}
          isMobile={isMobile}
          members={members}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onSubmit={handleAddEvent}
        />

        <AddPolicyModal
          isOpen={showAddPolicy}
          onOpenChange={setShowAddPolicy}
          isMobile={isMobile}
          newPolicy={newPolicy}
          setNewPolicy={setNewPolicy}
          onSubmit={handleAddPolicy}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      {uiState === 'success' && <SuccessBanner />}

      <div className="m3-segment">
        <SegmentTab
          active={subTab === 'members'}
          label="保障成員"
          onClick={() => setSubTab('members')}
        />
        <SegmentTab
          active={subTab === 'policies'}
          label={`所有保單 (${totalPolicies})`}
          onClick={() => setSubTab('policies')}
        />
      </div>

      {subTab === 'members' && (
        <section className="w-full max-w-full min-w-0">
          <div className="space-y-2 protection-grid">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className="m3-card p-4 w-full flex items-center gap-3 active:bg-sand-50"
              >
                <MemberAvatar
                  name={member.name}
                  seed={member.avatarSeed}
                  index={members.indexOf(member)}
                />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="text-xs text-gray-400">
                    {member.age} 歲 · {ROLE_LABELS[member.role]} · {member.policies.length} 張保單
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-teal-400" />
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </button>
            ))}
            <Button
              fullWidth
              size="lg"
              className="btn-accent btn-cta protection-grid--full"
              onPress={() => setShowAddMember(true)}
            >
              <Plus className="w-5 h-5" />
              新增成員
            </Button>
          </div>
        </section>
      )}

      {subTab === 'policies' && <AllPoliciesPanel members={members} />}

      <Modal.Backdrop isOpen={showAddMember} onOpenChange={setShowAddMember}>
        <Modal.Container placement={isMobile ? 'bottom' : 'center'}>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header><Modal.Heading>新增成員</Modal.Heading></Modal.Header>
            <Modal.Body>
              <div className="space-y-3">
                {[
                  { key: 'name', label: '姓名', type: 'text' },
                  { key: 'age', label: '年齡', type: 'number' },
                  { key: 'phone', label: '電話', type: 'tel' },
                  { key: 'email', label: 'Email', type: 'email' },
                  { key: 'occupation', label: '職業', type: 'text' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input
                      type={type}
                      value={String(newMember[key as keyof NewMemberInput] ?? '')}
                      onChange={(e) =>
                        setNewMember((prev) => ({
                          ...prev,
                          [key]: type === 'number' ? Number(e.target.value) : e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">角色</label>
                  <select
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember((prev) => ({
                        ...prev,
                        role: e.target.value as MemberRole,
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm"
                  >
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button fullWidth className="btn-accent" onPress={handleAddMember}>確認新增</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

    </div>
  )
}

function AddPolicyModal({
  isOpen,
  onOpenChange,
  isMobile,
  newPolicy,
  setNewPolicy,
  onSubmit,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isMobile: boolean
  newPolicy: NewPolicyInput
  setNewPolicy: React.Dispatch<React.SetStateAction<NewPolicyInput>>
  onSubmit: () => void
}) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header><Modal.Heading>自行登載保單</Modal.Heading></Modal.Header>
          <Modal.Body>
            <div className="flex items-start gap-2 p-2.5 mb-3 rounded-xl bg-sand-50 border border-dashed border-sand-300">
              <PenLine className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-500 leading-relaxed">
                自行登載的保單不會與保險工會集保同步，請確認資料正確後再新增
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">保單名稱 *</label>
                <input
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, name: e.target.value }))}
                  placeholder="例：旅平險、實支實付醫療險"
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">保險公司 *</label>
                <input
                  value={newPolicy.insurer}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, insurer: e.target.value }))}
                  placeholder="例：國泰人壽、富邦人壽"
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">保單類型 *</label>
                <select
                  value={newPolicy.type}
                  onChange={(e) =>
                    setNewPolicy((p) => ({
                      ...p,
                      type: e.target.value as Policy['type'],
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm"
                >
                  {Object.entries(POLICY_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">受益人</label>
                <input
                  value={newPolicy.beneficiary ?? ''}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, beneficiary: e.target.value }))}
                  placeholder="預設為本人"
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">到期日（選填）</label>
                <input
                  type="date"
                  value={newPolicy.expiryDate ?? ''}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">保障金額（選填）</label>
                <input
                  type="number"
                  value={newPolicy.coverage ?? 0}
                  onChange={(e) =>
                    setNewPolicy((p) => ({ ...p, coverage: Number(e.target.value) }))
                  }
                  placeholder="0"
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth className="btn-accent" onPress={onSubmit}>確認登載</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

function AddEventModal({
  isOpen,
  onOpenChange,
  isMobile,
  members,
  newEvent,
  setNewEvent,
  onSubmit,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isMobile: boolean
  members: FamilyMember[]
  newEvent: NewEventInput
  setNewEvent: React.Dispatch<React.SetStateAction<NewEventInput>>
  onSubmit: () => void
}) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header><Modal.Heading>新增保障規劃</Modal.Heading></Modal.Header>
          <Modal.Body>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">事件名稱 *</label>
                <input
                  value={newEvent.name}
                  onChange={(e) => setNewEvent((p) => ({ ...p, name: e.target.value }))}
                  placeholder={EVENT_FORM_PLACEHOLDERS.name}
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">事件類型（選填）</label>
                <select
                  value={newEvent.type ?? ''}
                  onChange={(e) =>
                    setNewEvent((p) => ({
                      ...p,
                      type: (e.target.value || undefined) as EventType | undefined,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm"
                >
                  <option value="">不指定</option>
                  {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">事件日期（選填）</label>
                <input
                  type="date"
                  value={newEvent.date ?? ''}
                  onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">事件頻率</label>
                <select
                  value={newEvent.frequency}
                  onChange={(e) =>
                    setNewEvent((p) => ({
                      ...p,
                      frequency: e.target.value as EventFrequency,
                    }))
                  }
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm"
                >
                  {Object.entries(FREQUENCY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">所需資金</label>
                <input
                  type="number"
                  value={newEvent.fundsNeeded}
                  onChange={(e) =>
                    setNewEvent((p) => ({ ...p, fundsNeeded: Number(e.target.value) }))
                  }
                  placeholder={EVENT_FORM_PLACEHOLDERS.fundsNeeded}
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">緊急程度</label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as TodoUrgency[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setNewEvent((p) => ({ ...p, urgency: u }))}
                      className={`m3-chip flex-1 py-2 text-center ${
                        newEvent.urgency === u
                          ? 'bg-teal-500 text-white'
                          : 'bg-sand-100 text-gray-600'
                      }`}
                    >
                      {URGENCY_LABELS[u]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">事件描述（選填）</label>
                <textarea
                  value={newEvent.description ?? ''}
                  onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                  placeholder={EVENT_FORM_PLACEHOLDERS.description}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm resize-none placeholder:text-gray-400 placeholder:text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">關聯成員</label>
                <div className="flex flex-wrap gap-2">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        const ids = newEvent.memberIds.includes(m.id)
                          ? newEvent.memberIds.filter((id) => id !== m.id)
                          : [...newEvent.memberIds, m.id]
                        setNewEvent((p) => ({ ...p, memberIds: ids }))
                      }}
                      className={`m3-chip px-3 py-1.5 ${
                        newEvent.memberIds.includes(m.id)
                          ? 'bg-teal-500 text-white'
                          : 'bg-sand-100 text-gray-600'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth className="btn-accent" onPress={onSubmit}>確認新增</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}