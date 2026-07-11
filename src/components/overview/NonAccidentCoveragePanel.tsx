import { Modal } from '@heroui/react'
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getClaimByPolicyId } from '../../data/claims'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type {
  FamilyMember,
  NonAccidentCoverageGroup,
  PolicyWithMember,
} from '../../types'
import { formatCurrency, formatWan, groupNonAccidentCoverage } from '../../utils/calculations'
import { CardSectionTitle, StackList } from '../common/CardLayout'
import { CoverageListItem } from '../common/CoverageListItem'
import { GroupSummaryCard } from '../common/GroupSummaryCard'
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
      <CardSectionTitle
        icon={ShieldCheck}
        actions={
          activeClaimCount > 0 ? (
            <span className="m3-chip bg-teal-50 text-teal-600 shrink-0">
              {activeClaimCount} 件理賠進行中
            </span>
          ) : undefined
        }
      >
        非意外保障額
      </CardSectionTitle>
      <div className="m3-card-filled p-4">
        <p className="text-xl md:text-2xl font-bold text-teal-700">{formatWan(totalAmount)}</p>
        <p className="text-caption text-teal-700 mt-1">{NON_ACCIDENT_SCOPE_NOTE}</p>

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
          <div className="mt-3 pt-3 border-t border-teal-100/80 ds-stack-list">
            {visibleGroups.map((group) => {
              const groupClaims = group.items.filter((item) => {
                const claim = getClaimByPolicyId(members, item.id)
                return claim && ['in_review', 'approved', 'pending_docs'].includes(claim.claimStatus)
              })
              return (
                <GroupSummaryCard
                  key={group.categoryType}
                  title={group.categoryLabel}
                  subtitle={`${group.memberNames.length} 位成員 · ${group.items.length} 張保單${
                    groupClaims.length > 0 ? ` · ${groupClaims.length} 件理賠進行中` : ''
                  }`}
                  amount={formatCoverageAmount(group.totalAmount, group.isMonthly)}
                  variant="nested"
                  onClick={() => setSelectedGroup(group)}
                />
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
                <div className="ds-stack-block">
                  <p className="text-xs text-gray-500">
                    合計 {formatCoverageAmount(selectedGroup.totalAmount, selectedGroup.isMonthly)} ·{' '}
                    {selectedGroup.items.length} 張保單 · {selectedGroup.memberNames.length} 位成員
                  </p>
                  <StackList>
                    {selectedGroup.items.map((item) => {
                      const member = findMemberByPolicyId(members, item.id)
                      const claim = getClaimByPolicyId(members, item.id)
                      return (
                        <CoverageListItem
                          key={item.id}
                          item={item}
                          member={member}
                          claim={claim}
                          formatAmount={(amount, isMonthly) =>
                            formatCoverageAmount(amount, isMonthly ?? false)
                          }
                          onOpenPolicy={setSelectedPolicy}
                        />
                      )
                    })}
                  </StackList>
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