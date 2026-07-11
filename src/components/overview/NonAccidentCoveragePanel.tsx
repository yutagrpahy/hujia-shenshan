import { Modal } from '@heroui/react'
import { AlertCircle, ChevronDown, ChevronRight, ChevronUp, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getClaimByPolicyId } from '../../data/claims'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type {
  ClaimRecord,
  FamilyMember,
  NonAccidentCoverageGroup,
  NonAccidentCoverageItem,
  PolicyWithMember,
} from '../../types'
import { formatCurrency, formatWan, groupNonAccidentCoverage } from '../../utils/calculations'
import { ClaimProgressRing, claimRingTone } from '../common/ClaimProgressRing'
import { MemberAvatar } from '../common/MemberAvatar'
import { PolicyDetailModal } from '../protection/PolicyDetailModal'

const VISIBLE_LIMIT = 5

/** 依主管機關／壽險公會人身保險險種分類：人壽、健康、年金；不含傷害保險 */
const NON_ACCIDENT_SCOPE_NOTE =
  '依人身保險險種分類，涵蓋人壽保險、健康保險與年金保險之約定給付保額，不含傷害保險（意外險）。'

function formatCoverageAmount(amount: number, isMonthly: boolean): string {
  return isMonthly ? `${formatCurrency(amount)}/月` : formatCurrency(amount)
}

function findMemberByPolicyId(members: FamilyMember[], policyId: string) {
  return members.find((member) => member.policies.some((policy) => policy.id === policyId))
}

function CoverageItemRow({
  item,
  member,
  claim,
  onOpenPolicy,
}: {
  item: NonAccidentCoverageItem
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
        <p className="text-sm font-semibold text-teal-700">
          {formatCoverageAmount(item.amount, item.isMonthly)}
        </p>
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

export function NonAccidentCoveragePanel({
  members,
  totalAmount,
}: {
  members: FamilyMember[]
  totalAmount: number
}) {
  const groups = useMemo(() => groupNonAccidentCoverage(members), [members])
  const [typesRevealed, setTypesRevealed] = useState(false)
  const [listExpanded, setListExpanded] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<NonAccidentCoverageGroup | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyWithMember | null>(null)
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

  const visibleGroups = listExpanded ? groups : groups.slice(0, VISIBLE_LIMIT)
  const hasMore = groups.length > VISIBLE_LIMIT

  const activeClaimCount = useMemo(() => {
    const policyIds = new Set(groups.flatMap((group) => group.items.map((item) => item.id)))
    return [...policyIds].filter((id) => {
      const claim = getClaimByPolicyId(members, id)
      return claim && ['in_review', 'approved', 'pending_docs'].includes(claim.claimStatus)
    }).length
  }, [groups, members])

  return (
    <>
      <div className="m3-card-filled p-4 mb-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-xs font-medium text-teal-600">非意外保障額</span>
          </div>
          {activeClaimCount > 0 && (
            <span className="m3-chip bg-teal-50 text-teal-600 shrink-0">
              {activeClaimCount} 件理賠進行中
            </span>
          )}
        </div>
        <p className="text-xl md:text-2xl font-bold text-teal-700">{formatWan(totalAmount)}</p>
        <p className="text-[10px] text-teal-600/80 mt-1 leading-relaxed">{NON_ACCIDENT_SCOPE_NOTE}</p>

        {groups.length > 0 && (
          <button
            type="button"
            onClick={() => setTypesRevealed((value) => !value)}
            className="m3-soft-btn m3-soft-btn--teal mt-3"
          >
            {typesRevealed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                收合保障分類
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                查看保障分類（{groups.length} 類）
              </>
            )}
          </button>
        )}

        {typesRevealed && groups.length > 0 && (
          <div className="mt-3 pt-3 border-t border-teal-100/80 space-y-2">
            {visibleGroups.map((group) => {
              const groupClaims = group.items.filter((item) => {
                const claim = getClaimByPolicyId(members, item.id)
                return claim && ['in_review', 'approved', 'pending_docs'].includes(claim.claimStatus)
              })
              return (
                <button
                  key={group.categoryType}
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className="m3-card p-3 bg-white/70 w-full flex items-center justify-between gap-3 active:bg-sand-50 text-left transition-colors hover:bg-sand-50/80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800">{group.categoryLabel}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {group.memberNames.length} 位成員 · {group.items.length} 張保單
                      {groupClaims.length > 0 && ` · ${groupClaims.length} 件理賠進行中`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-bold text-teal-700">
                      {formatCoverageAmount(group.totalAmount, group.isMonthly)}
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </button>
              )
            })}
            {hasMore && (
              <button
                type="button"
                onClick={() => setListExpanded((value) => !value)}
                className="w-full py-2 text-xs font-medium text-teal-600 flex items-center justify-center gap-1 hover:underline"
              >
                {listExpanded ? (
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
              <Modal.Heading>{selectedGroup?.categoryLabel}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {selectedGroup && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    合計 {formatCoverageAmount(selectedGroup.totalAmount, selectedGroup.isMonthly)} ·{' '}
                    {selectedGroup.items.length} 張保單 · {selectedGroup.memberNames.length} 位成員
                  </p>
                  <div className="space-y-2">
                    {selectedGroup.items.map((item) => {
                      const member = findMemberByPolicyId(members, item.id)
                      const claim = getClaimByPolicyId(members, item.id)
                      return (
                        <CoverageItemRow
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