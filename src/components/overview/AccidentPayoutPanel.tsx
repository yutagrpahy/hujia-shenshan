import { Modal } from '@heroui/react'
import { ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getClaimByPolicyId } from '../../data/claims'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type {
  AccidentPayoutGroup,
  AccidentPayoutItem,
  FamilyMember,
  PolicyWithMember,
} from '../../types'
import { formatCurrency, groupAccidentPayouts } from '../../utils/calculations'
import { CardSectionTitle, StackList } from '../common/CardLayout'
import { CoverageListItem } from '../common/CoverageListItem'
import { GroupSummaryCard } from '../common/GroupSummaryCard'
import { PolicyDetailModal } from '../protection/PolicyDetailModal'

const VISIBLE_LIMIT = 5

function findMemberByPolicyId(members: FamilyMember[], policyId: string) {
  return members.find((member) => member.policies.some((policy) => policy.id === policyId))
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
        <CardSectionTitle icon={Shield}>意外保障額</CardSectionTitle>
        <p className="text-xs text-gray-400">尚無意外保障額項目</p>
      </div>
    )
  }

  return (
    <>
      <div>
        <CardSectionTitle
          icon={Shield}
          actions={
            activeClaimCount > 0 ? (
              <span className="m3-chip bg-teal-50 text-teal-600 shrink-0">
                {activeClaimCount} 件進行中
              </span>
            ) : undefined
          }
        >
          意外保障額
        </CardSectionTitle>
        <StackList>
          {visibleGroups.map((group) => {
            const groupClaims = group.items.filter((item) =>
              getClaimByPolicyId(members, item.id),
            )
            return (
              <GroupSummaryCard
                key={group.eventType}
                title={group.eventLabel}
                subtitle={`${group.memberNames.length} 位成員 · ${group.items.length} 張保單${
                  groupClaims.length > 0 ? ` · ${groupClaims.length} 件理賠進行中` : ''
                }`}
                amount={formatCurrency(group.totalAmount)}
                onClick={() => setSelectedGroup(group)}
              />
            )
          })}
        </StackList>
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
                <div className="ds-stack-block">
                  <p className="text-xs text-gray-500">
                    合計 {formatCurrency(selectedGroup.totalAmount)} ·{' '}
                    {selectedGroup.items.length} 張保單 · {selectedGroup.memberNames.length}{' '}
                    位成員
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
                          formatAmount={(amount) => formatCurrency(amount)}
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