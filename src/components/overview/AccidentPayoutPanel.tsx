import { Modal } from '@heroui/react'
import { AlertCircle, ChevronDown, ChevronRight, ChevronUp, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getClaimByPolicyId } from '../../data/claims'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type {
  AccidentPayoutGroup,
  AccidentPayoutItem,
  ClaimRecord,
  FamilyMember,
  PolicyWithMember,
} from '../../types'
import { formatCurrency, groupAccidentPayouts } from '../../utils/calculations'
import { ClaimProgressRing, claimRingTone } from '../common/ClaimProgressRing'
import { MemberAvatar } from '../common/MemberAvatar'
import { PolicyDetailModal } from '../protection/PolicyDetailModal'

const VISIBLE_LIMIT = 5

function findMemberByPolicyId(members: FamilyMember[], policyId: string) {
  return members.find((member) => member.policies.some((policy) => policy.id === policyId))
}

function PayoutItemRow({
  item,
  member,
  claim,
  onOpenPolicy,
}: {
  item: AccidentPayoutItem
  member?: FamilyMember
  claim?: ClaimRecord
  onOpenPolicy?: (item: PolicyWithMember) => void
}) {
  const hasClaim = !!claim
  const policy = member?.policies.find((entry) => entry.id === item.id)
  const isClickable = !!onOpenPolicy && !!member && !!policy

  const content = (
    <>
      <div className="relative shrink-0">
        {hasClaim ? (
          <ClaimProgressRing
            progress={claim.progress}
            tone={claimRingTone(claim.claimStatus, claim.isError)}
            size={44}
            label={`${claim.progress}%`}
          />
        ) : member ? (
          <MemberAvatar name={member.name} seed={member.avatarSeed} size="sm" />
        ) : (
          <div className="m3-icon-wrap m3-icon-wrap--sm shrink-0" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-800">{item.memberName}</p>
          {hasClaim && (
            <span
              className={`m3-chip shrink-0 ${
                claim.isError
                  ? 'bg-red-50 text-red-600'
                  : claim.claimStatus === 'in_review'
                    ? 'bg-teal-50 text-teal-600'
                    : 'bg-amber-50 text-amber-600'
              }`}
            >
              {claim.isError && <AlertCircle className="w-3 h-3 inline mr-0.5 -mt-0.5" />}
              {claim.statusLabel}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{item.insurer}</p>
        <p className="text-[10px] text-gray-400 truncate">{item.policyName}</p>
        {hasClaim && (
          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed line-clamp-2">
            {claim.statusSummary}
          </p>
        )}
      </div>
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        <p className="text-sm font-semibold text-teal-700">{formatCurrency(item.amount)}</p>
        {isClickable && (
          <p className="text-[10px] text-teal-600">
            {hasClaim && claim.isError ? '查看保單' : hasClaim ? '理賠詳情' : '查看保單'}
          </p>
        )}
        {isClickable && <ChevronRight className="w-4 h-4 text-gray-300" />}
      </div>
    </>
  )

  if (!isClickable) {
    return <div className="m3-card p-3 flex items-start gap-3">{content}</div>
  }

  return (
    <button
      type="button"
      onClick={() =>
        onOpenPolicy({
          policy: policy!,
          memberId: member.id,
          memberName: member.name,
          avatarSeed: member.avatarSeed,
        })
      }
      className="m3-card p-3 flex items-start gap-3 w-full text-left transition-colors hover:bg-sand-50/80 active:bg-sand-100/60"
    >
      {content}
    </button>
  )
}

export function AccidentPayoutPanel({
  items,
  members,
}: {
  items: AccidentPayoutItem[]
  members: FamilyMember[]
}) {
  const groups = useMemo(() => groupAccidentPayouts(items), [items])
  const [expanded, setExpanded] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<AccidentPayoutGroup | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyWithMember | null>(null)
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

  const visibleGroups = expanded ? groups : groups.slice(0, VISIBLE_LIMIT)
  const hasMore = groups.length > VISIBLE_LIMIT

  const activeClaimCount = useMemo(
    () => items.filter((item) => getClaimByPolicyId(members, item.id)).length,
    [items, members],
  )

  if (groups.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs font-medium text-gray-600">意外保障額</span>
        </div>
        <p className="text-xs text-gray-400 px-1">尚無意外保障額項目</p>
      </div>
    )
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="text-xs font-medium text-gray-600">意外保障額</span>
          </div>
          {activeClaimCount > 0 && (
            <span className="m3-chip bg-teal-50 text-teal-600 shrink-0">
              {activeClaimCount} 件進行中
            </span>
          )}
        </div>
        <div className="space-y-2">
          {visibleGroups.map((group) => {
            const groupClaims = group.items.filter((item) =>
              getClaimByPolicyId(members, item.id),
            )
            return (
              <button
                key={group.eventType}
                type="button"
                onClick={() => setSelectedGroup(group)}
                className="m3-card p-3 bg-warm-50 w-full flex items-center justify-between gap-3 active:bg-sand-50 text-left transition-colors hover:bg-sand-50/80"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800">{group.eventLabel}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {group.memberNames.length} 位成員 · {group.items.length} 張保單
                    {groupClaims.length > 0 && ` · ${groupClaims.length} 件理賠進行中`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-sm font-bold text-teal-700">
                    {formatCurrency(group.totalAmount)}
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </button>
            )
          })}
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="w-full mt-2 py-2 text-xs font-medium text-teal-600 flex items-center justify-center gap-1 hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                收合
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                展開其餘 {groups.length - VISIBLE_LIMIT} 類
              </>
            )}
          </button>
        )}
      </div>

      <Modal.Backdrop
        isOpen={!!selectedGroup}
        onOpenChange={(open) => !open && setSelectedGroup(null)}
      >
        <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{selectedGroup?.eventLabel}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {selectedGroup && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    合計 {formatCurrency(selectedGroup.totalAmount)} ·{' '}
                    {selectedGroup.items.length} 張保單 · {selectedGroup.memberNames.length}{' '}
                    位成員
                  </p>
                  <div className="space-y-2">
                    {selectedGroup.items.map((item) => {
                      const member = findMemberByPolicyId(members, item.id)
                      const claim = getClaimByPolicyId(members, item.id)
                      return (
                        <PayoutItemRow
                          key={item.id}
                          item={item}
                          member={member}
                          claim={claim}
                          onOpenPolicy={setSelectedPolicy}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <PolicyDetailModal
        item={selectedPolicy}
        isOpen={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
        isMobile={isMobile}
      />
    </>
  )
}