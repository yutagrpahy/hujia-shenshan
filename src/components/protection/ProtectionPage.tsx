import { Button, Modal } from '@heroui/react'
import {
  ChevronLeft,
  Lock,
  PenLine,
  Plus,
  Shield,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  ROLE_LABELS,
  STAGE_LABELS,
} from '../../data/mockData'
import { UNION_INFO_SYSTEM_NAME } from '../../data/policySourceLabels'
import { countMemberReminders, getTodoCountChipClass } from '../../data/todoLabels'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import {
  CardItem,
  CardItemChevron,
  CardItemMeta,
  CardItemMetaLabel,
  CardItemTriAction,
  CardItemTriIndicator,
  CardItemTriMain,
  CardItemTriRow,
  CardItemSubtitle,
  CardItemTags,
  CardSectionTitle,
  FormLabel,
  PageStack,
  StackForm,
  StackList,
} from '../common/CardLayout'
import { DocumentVault } from '../common/DocumentVault'
import { EventFormModal } from '../common/EventFormModal'
import { MemberAvatar } from '../common/MemberAvatar'
import { PolicyListCard } from '../common/PolicyListCard'

import { POLICY_TYPE_LABELS } from '../../data/policyLabels'
import { SuccessBanner } from '../common/StateViews'
import {
  countMemberPolicies,
  groupMemberPoliciesByGapCategory,
  isPolicyEffective,
} from '../../utils/calculations'
import { AllPoliciesPanel } from './AllPoliciesPanel'
import { MemberTodosSection } from './MemberTodosSection'
import { PolicyDetailModal } from './PolicyDetailModal'
import type {
  MemberRole,
  NewEventInput,
  NewMemberInput,
  NewPolicyInput,
  Policy,
  PolicyWithMember,
} from '../../types'



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
    completeTodo,
    historyTodos,
    selectedMemberId,
    setSelectedMemberId,
    memberNavigationTarget,
    clearMemberNavigationTarget,
    uiState,
  } = useApp()

  const [subTab, setSubTab] = useState<ProtectionSubTab>('members')
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyWithMember | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const totalPolicies = countMemberPolicies(members)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showAddPolicy, setShowAddPolicy] = useState(false)
  const [highlightedPolicyId, setHighlightedPolicyId] = useState<string | null>(null)
  const [memberPolicyTab, setMemberPolicyTab] = useState<'effective' | 'expired'>('effective')
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

  const memberPolicyGroups = useMemo(
    () =>
      selectedMember ? groupMemberPoliciesByGapCategory(selectedMember) : [],
    [selectedMember],
  )

  const filteredMemberPolicyGroups = useMemo(
    () =>
      memberPolicyGroups
        .map((group) => ({
          ...group,
          policies: group.policies.filter(({ policy }) =>
            memberPolicyTab === 'effective'
              ? isPolicyEffective(policy)
              : !isPolicyEffective(policy),
          ),
        }))
        .filter((group) => group.policies.length > 0),
    [memberPolicyGroups, memberPolicyTab],
  )

  const memberPolicyCounts = useMemo(() => {
    if (!selectedMember) return { effective: 0, expired: 0 }
    return selectedMember.policies.reduce(
      (counts, policy) => {
        if (isPolicyEffective(policy)) counts.effective += 1
        else counts.expired += 1
        return counts
      },
      { effective: 0, expired: 0 },
    )
  }, [selectedMember])

  useEffect(() => {
    setMemberPolicyTab('effective')
    setHighlightedPolicyId(null)
  }, [selectedMemberId])

  useEffect(() => {
    if (!selectedMember || !memberNavigationTarget) return
    if (memberNavigationTarget.memberId !== selectedMember.id) return

    const { policyId, gapKey } = memberNavigationTarget
    if (policyId) {
      const policy = selectedMember.policies.find((entry) => entry.id === policyId)
      setMemberPolicyTab(policy && !isPolicyEffective(policy) ? 'expired' : 'effective')
    }

    const scrollTargetId = policyId
      ? `member-policy-${policyId}`
      : gapKey
        ? `member-gap-section-${gapKey}`
        : null

    const timer = window.setTimeout(() => {
      const element = scrollTargetId ? document.getElementById(scrollTargetId) : null
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        if (policyId) {
          setHighlightedPolicyId(policyId)
          window.setTimeout(() => setHighlightedPolicyId(null), 2400)
        }
      }
      clearMemberNavigationTarget()
    }, policyId ? 220 : 150)

    return () => window.clearTimeout(timer)
  }, [
    selectedMember,
    memberNavigationTarget,
    clearMemberNavigationTarget,
  ])

  if (selectedMember) {
    const memberTodos = todos.filter((t) => t.memberId === selectedMember.id)
    const memberDocs = documents.filter((d) => d.ownerMemberId === selectedMember.id)
    const memberEvents = familyEvents.filter((e) => e.memberIds.includes(selectedMember.id))
    const isSelf = selectedMember.id === currentUserId
    return (
      <div className="member-detail-page">
        {uiState === 'success' && (
          <SuccessBanner title="事項已完成" message="已移至已完成事件，並通知相關家人。" />
        )}

        <header className="member-detail-back">
          <button
            type="button"
            onClick={() => setSelectedMemberId(null)}
            className="member-detail-back__btn"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden />
            返回家庭成員
          </button>
        </header>

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

        <section className="member-policies-section">
          <CardSectionTitle
            actions={
              <Button
                size="sm"
                variant="secondary"
                className="border-teal-200 text-teal-700 shrink-0"
                onPress={() => setShowAddPolicy(true)}
              >
                <Plus className="w-3.5 h-3.5" aria-hidden />
                新增保單
              </Button>
            }
          >
            保單
          </CardSectionTitle>

          <div className="member-policies-panel">
          {selectedMember.policies.length === 0 ? (
            <p className="text-sm text-gray-400 m3-card p-4">尚無保單，可點「新增保單」自行登載</p>
          ) : (
            <>
              <div className="m3-segment grid grid-cols-2 gap-1">
                <SegmentTab
                  active={memberPolicyTab === 'effective'}
                  label={`有效保單 (${memberPolicyCounts.effective})`}
                  onClick={() => setMemberPolicyTab('effective')}
                />
                <SegmentTab
                  active={memberPolicyTab === 'expired'}
                  label={`失效保單 (${memberPolicyCounts.expired})`}
                  onClick={() => setMemberPolicyTab('expired')}
                />
              </div>

              {filteredMemberPolicyGroups.length === 0 ? (
                <p className="text-sm text-gray-400 m3-card p-4">
                  {memberPolicyTab === 'effective'
                    ? '目前沒有有效保單'
                    : '目前沒有失效保單'}
                </p>
              ) : (
                <StackList loose>
                  {filteredMemberPolicyGroups.map((group) => (
                    <div
                      key={group.gapKey}
                      id={`member-gap-section-${group.gapKey}`}
                      className="scroll-mt-28"
                    >
                      <CardSectionTitle>{group.category}</CardSectionTitle>
                      <StackList>
                        {group.policies.map(({ policy: p }) => (
                          <PolicyListCard
                            key={p.id}
                            id={`member-policy-${p.id}`}
                            policy={p}
                            memberId={selectedMember.id}
                            members={members}
                            showMember={false}
                            highlighted={highlightedPolicyId === p.id}
                            onClick={() =>
                              setSelectedPolicy({
                                policy: p,
                                memberId: selectedMember.id,
                                memberName: selectedMember.name,
                                avatarSeed: selectedMember.avatarSeed,
                              })
                            }
                          />
                        ))}
                      </StackList>
                    </div>
                  ))}
                </StackList>
              )}
            </>
          )}
          </div>
        </section>

        <div className="member-detail-follow-block">
          <MemberTodosSection
            member={selectedMember}
            members={members}
            todos={memberTodos}
            historyTodos={historyTodos}
            events={memberEvents}
            onAdd={() => openAddEventForMember(selectedMember.id)}
            onCompleteTodo={completeTodo}
          />
        </div>

        <section className="member-detail-follow-block">
          <CardSectionTitle icon={Lock} subtitle="加密儲存重要文件，僅授權家人瀏覽">
            安全文件庫
          </CardSectionTitle>
          <DocumentVault documents={memberDocs} canUpload={isSelf} />
        </section>

        <EventFormModal
          isOpen={showAddEvent}
          onOpenChange={setShowAddEvent}
          members={members}
          eventInput={newEvent}
          setEventInput={setNewEvent}
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

        <PolicyDetailModal
          item={selectedPolicy}
          isOpen={!!selectedPolicy}
          onOpenChange={(open) => !open && setSelectedPolicy(null)}
          isMobile={isMobile}
        />
      </div>
    )
  }

  return (
    <PageStack>
      {uiState === 'success' && <SuccessBanner />}

      <div className="m3-segment">
        <SegmentTab
          active={subTab === 'members'}
          label="家庭成員"
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
          <StackList className="protection-grid">
            {members.map((member) => {
              const memberTodos = todos.filter((todo) => todo.memberId === member.id)
              const memberEvents = familyEvents.filter((event) =>
                event.memberIds.includes(member.id),
              )
              const { total: memberTodoCount, hasUrgent } = countMemberReminders(
                memberTodos,
                memberEvents,
              )

              return (
                <CardItem
                  key={member.id}
                  as="button"
                  interactive
                  className="m3-card-item--lg active:bg-sand-50"
                  onClick={() => setSelectedMemberId(member.id)}
                >
                  <CardItemTriRow>
                    <CardItemTriMain>
                      <CardItemMeta>
                        <MemberAvatar
                          name={member.name}
                          seed={member.avatarSeed}
                          index={members.indexOf(member)}
                          size="sm"
                        />
                        <CardItemMetaLabel>{member.name}</CardItemMetaLabel>
                      </CardItemMeta>
                      <CardItemSubtitle>
                        {member.age} 歲 · {ROLE_LABELS[member.role]} · {member.policies.length} 張保單
                      </CardItemSubtitle>
                      {memberTodoCount > 0 ? (
                        <CardItemTags>
                          <span className={`m3-chip shrink-0 ${getTodoCountChipClass(hasUrgent)}`}>
                            {memberTodoCount} 項待辦
                          </span>
                        </CardItemTags>
                      ) : null}
                    </CardItemTriMain>
                    <CardItemTriIndicator>
                      <Shield className="w-5 h-5 text-teal-400" />
                    </CardItemTriIndicator>
                    <CardItemTriAction>
                      <CardItemChevron />
                    </CardItemTriAction>
                  </CardItemTriRow>
                </CardItem>
              )
            })}
            <Button
              fullWidth
              size="lg"
              className="btn-accent btn-cta protection-grid--full"
              onPress={() => setShowAddMember(true)}
            >
              <Plus className="w-5 h-5" />
              新增成員
            </Button>
          </StackList>
        </section>
      )}

      {subTab === 'policies' && (
        <AllPoliciesPanel members={members} onSelectPolicy={setSelectedPolicy} />
      )}

      <Modal.Backdrop isOpen={showAddMember} onOpenChange={setShowAddMember}>
        <Modal.Container placement={isMobile ? 'bottom' : 'center'}>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header><Modal.Heading>新增成員</Modal.Heading></Modal.Header>
            <Modal.Body>
              <StackForm>
                {[
                  { key: 'name', label: '姓名', type: 'text' },
                  { key: 'age', label: '年齡', type: 'number' },
                  { key: 'phone', label: '電話', type: 'tel' },
                  { key: 'email', label: 'Email', type: 'email' },
                  { key: 'occupation', label: '職業', type: 'text' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <FormLabel>{label}</FormLabel>
                    <input
                      type={type}
                      value={String(newMember[key as keyof NewMemberInput] ?? '')}
                      onChange={(e) =>
                        setNewMember((prev) => ({
                          ...prev,
                          [key]: type === 'number' ? Number(e.target.value) : e.target.value,
                        }))
                      }
                      className="m3-field"
                    />
                  </div>
                ))}
                <div>
                  <FormLabel>角色</FormLabel>
                  <select
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember((prev) => ({
                        ...prev,
                        role: e.target.value as MemberRole,
                      }))
                    }
                    className="m3-field"
                  >
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </StackForm>
            </Modal.Body>
            <Modal.Footer>
              <Button fullWidth className="btn-accent" onPress={handleAddMember}>確認新增</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <PolicyDetailModal
        item={selectedPolicy}
        isOpen={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
        isMobile={isMobile}
      />
    </PageStack>
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
            <div className="m3-callout flex items-start gap-2 mb-3">
              <PenLine className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-500 leading-relaxed">
                {`自行登載的保單不會與${UNION_INFO_SYSTEM_NAME}同步，請確認資料正確後再新增`}
              </p>
            </div>
            <StackForm>
              <div>
                <FormLabel>保單名稱 *</FormLabel>
                <input
                  value={newPolicy.name}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, name: e.target.value }))}
                  placeholder="例：旅平險、實支實付醫療險"
                  className="m3-field"
                />
              </div>
              <div>
                <FormLabel>保險公司 *</FormLabel>
                <input
                  value={newPolicy.insurer}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, insurer: e.target.value }))}
                  placeholder="例：國泰人壽、富邦人壽"
                  className="m3-field"
                />
              </div>
              <div>
                <FormLabel>保單類型 *</FormLabel>
                <select
                  value={newPolicy.type}
                  onChange={(e) =>
                    setNewPolicy((p) => ({
                      ...p,
                      type: e.target.value as Policy['type'],
                    }))
                  }
                  className="m3-field"
                >
                  {Object.entries(POLICY_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <FormLabel>受益人</FormLabel>
                <input
                  value={newPolicy.beneficiary ?? ''}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, beneficiary: e.target.value }))}
                  placeholder="預設為本人"
                  className="m3-field"
                />
              </div>
              <div>
                <FormLabel>到期日（選填）</FormLabel>
                <input
                  type="date"
                  value={newPolicy.expiryDate ?? ''}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, expiryDate: e.target.value }))}
                  className="m3-field"
                />
              </div>
              <div>
                <FormLabel>保障金額（選填）</FormLabel>
                <input
                  type="number"
                  value={newPolicy.coverage ?? 0}
                  onChange={(e) =>
                    setNewPolicy((p) => ({ ...p, coverage: Number(e.target.value) }))
                  }
                  placeholder="0"
                  className="m3-field"
                />
              </div>
            </StackForm>
          </Modal.Body>
          <Modal.Footer>
            <Button fullWidth className="btn-accent" onPress={onSubmit}>確認登載</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

