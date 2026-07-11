import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import {
  buildFamilyClaims,
  CLAIM_STATUS_GROUP,
  CLAIM_STATUS_ORDER,
  CLAIM_TAB_LABELS,
  CLAIM_TAB_STATUSES,
  countClaimsByTab,
  type ClaimTab,
} from '../../data/claims'
import type { ClaimRecord, PolicyWithMember } from '../../types'
import { formatCurrency } from '../../utils/calculations'
import {
  CardItem,
  CardItemChevron,
  CardItemDetail,
  CardItemMain,
  CardItemMeta,
  CardItemMetaLabel,
  CardItemRow,
  CardItemSubtitle,
  CardItemTitle,
} from '../common/CardLayout'
import { ClaimProgressRing, claimRingTone } from '../common/ClaimProgressRing'
import { MemberAvatar } from '../common/MemberAvatar'
import { PolicyDetailModal } from '../protection/PolicyDetailModal'

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

function ClaimCard({
  claim,
  onSelect,
}: {
  claim: ClaimRecord
  onSelect: (claim: ClaimRecord) => void
}) {
  const ringTone = claimRingTone(claim.claimStatus, claim.isError)
  const statusTone = CLAIM_STATUS_GROUP[claim.claimStatus].tone

  return (
    <CardItem
      as="button"
      interactive
      className={`claim-card claim-card--${statusTone}`}
      onClick={() => onSelect(claim)}
    >
      <CardItemRow>
        <div className="m3-card-item__media">
          <ClaimProgressRing
            progress={claim.progress}
            tone={ringTone}
            label={`${claim.progress}%`}
          />
        </div>
        <CardItemMain>
          <CardItemMeta>
            <MemberAvatar name={claim.memberName} seed={claim.avatarSeed} size="xs" />
            <CardItemMetaLabel>{claim.memberName}</CardItemMetaLabel>
            <span className={`m3-chip claim-chip claim-chip--${statusTone} shrink-0`}>
              {claim.statusLabel}
            </span>
          </CardItemMeta>
          <CardItemTitle>{claim.policyName}</CardItemTitle>
          <CardItemSubtitle>
            {claim.eventLabel} · {claim.insurer}
          </CardItemSubtitle>
          <CardItemDetail className="text-gray-500 line-clamp-2">
            {claim.statusSummary}
          </CardItemDetail>
          {claim.amount ? (
            <CardItemDetail className="text-teal-700 font-semibold text-xs mt-1">
              理賠金額 {formatCurrency(claim.amount)}
            </CardItemDetail>
          ) : null}
        </CardItemMain>
        <CardItemChevron className="mt-1" />
      </CardItemRow>
    </CardItem>
  )
}

export function ClaimsPage() {
  const { members } = useApp()
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const claims = useMemo(() => buildFamilyClaims(members), [members])
  const tabCounts = useMemo(() => countClaimsByTab(claims), [claims])
  const [activeTab, setActiveTab] = useState<ClaimTab>('pending')
  const tabClaims = useMemo(() => {
    const statuses = CLAIM_TAB_STATUSES[activeTab]
    return claims
      .filter((claim) => statuses.includes(claim.claimStatus))
      .sort(
        (a, b) =>
          CLAIM_STATUS_ORDER.indexOf(a.claimStatus) -
          CLAIM_STATUS_ORDER.indexOf(b.claimStatus),
      )
  }, [claims, activeTab])
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyWithMember | null>(null)

  const openPolicyDetail = (claim: ClaimRecord) => {
    const member = members.find((item) => item.id === claim.memberId)
    const policy = member?.policies.find((item) => item.id === claim.policyId)
    if (!member || !policy) return
    setSelectedPolicy({
      policy,
      memberId: member.id,
      memberName: member.name,
      avatarSeed: member.avatarSeed,
    })
  }

  const tabEmptyMessage: Record<ClaimTab, string> = {
    pending: '目前沒有待處理的理賠或保單作業',
    in_progress: '目前沒有進行中的理賠案件',
    completed: '目前沒有已完成的理賠給付紀錄',
  }

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      <div className="m3-segment">
        {(Object.keys(CLAIM_TAB_LABELS) as ClaimTab[]).map((tab) => (
          <SegmentTab
            key={tab}
            active={activeTab === tab}
            label={`${CLAIM_TAB_LABELS[tab]} (${tabCounts[tab]})`}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {claims.length === 0 ? (
        <div className="m3-card p-8 text-center">
          <p className="text-sm text-gray-500">目前沒有理賠或保單作業項目</p>
        </div>
      ) : tabClaims.length === 0 ? (
        <div className="m3-card p-8 text-center">
          <p className="text-sm text-gray-500">{tabEmptyMessage[activeTab]}</p>
        </div>
      ) : (
        <div className="claims-list space-y-2">
          {tabClaims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} onSelect={openPolicyDetail} />
          ))}
        </div>
      )}

      <PolicyDetailModal
        item={selectedPolicy}
        isOpen={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
        isMobile={isMobile}
      />
    </div>
  )
}