import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
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
    <button
      type="button"
      onClick={() => onSelect(claim)}
      className={`claim-card claim-card--${statusTone} m3-card p-3.5 w-full text-left flex items-start gap-3 transition-colors hover:bg-sand-50/80 active:bg-sand-100/60`}
    >
      <ClaimProgressRing
        progress={claim.progress}
        tone={ringTone}
        label={`${claim.progress}%`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <MemberAvatar name={claim.memberName} seed={claim.avatarSeed} size="xs" />
          <span className="text-xs font-medium text-teal-700 truncate">{claim.memberName}</span>
          <span className={`m3-chip claim-chip claim-chip--${statusTone} shrink-0`}>
            {claim.statusLabel}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-800 truncate">{claim.policyName}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {claim.eventLabel} · {claim.insurer}
        </p>
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
          {claim.statusSummary}
        </p>
        {claim.amount ? (
          <p className="text-xs font-semibold text-teal-700 mt-1">
            理賠金額 {formatCurrency(claim.amount)}
          </p>
        ) : null}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
    </button>
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