import { Modal } from '@heroui/react'
import { ChevronRight, HeartPulse, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getClaimByPolicyId } from '../../data/claims'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type {
  FamilyCoverageDomainSummary,
  FamilyCoveragePolicyItem,
  FamilyMember,
  PolicyWithMember,
} from '../../types'
import { computeFamilyCoverageDomains, formatCurrency } from '../../utils/calculations'
import { StackBlock, StackList } from '../common/CardLayout'
import { CoverageListItem } from '../common/CoverageListItem'
import { PolicyDetailModal } from '../protection/PolicyDetailModal'

const ACTIVE_CLAIM_STATUSES = ['in_review', 'approved', 'pending_docs'] as const

function formatHeadlineAmount(amount: number): string {
  if (amount === 0) return '0 萬'
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)} 萬`
  }
  return formatCurrency(amount)
}

function formatItemAmount(amount: number, isMonthly: boolean): string {
  return isMonthly ? `${formatCurrency(amount)}/月` : formatCurrency(amount)
}

function formatMemberHolding(names: string[]): string {
  if (names.length === 0) return '尚無成員投保'
  if (names.length <= 2) return `${names.join('、')} 持有`
  return `${names.slice(0, 2).join('、')} 等 ${names.length} 位成員持有`
}

function countActiveClaims(members: FamilyMember[], summary: FamilyCoverageDomainSummary): number {
  const policyIds = summary.subcategories.flatMap((group) => group.items.map((item) => item.id))
  return policyIds.filter((id) => {
    const claim = getClaimByPolicyId(members, id)
    return claim && ACTIVE_CLAIM_STATUSES.includes(claim.claimStatus as (typeof ACTIVE_CLAIM_STATUSES)[number])
  }).length
}

function findMemberByPolicyId(members: FamilyMember[], policyId: string) {
  return members.find((member) => member.policies.some((policy) => policy.id === policyId))
}

function coverageAmountClass(item: FamilyCoveragePolicyItem): string {
  if (item.amount === 0 && !item.isMonthly) return 'text-gray-400'
  if (item.subcategoryType === 'critical' || item.subcategoryType === 'hospital') {
    return 'text-sky-800'
  }
  return 'text-teal-700'
}

function CoverageEntryCard({
  summary,
  variant,
  activeClaimCount,
  onOpen,
}: {
  summary: FamilyCoverageDomainSummary
  variant: 'life' | 'medical'
  activeClaimCount: number
  onOpen: () => void
}) {
  const Icon = variant === 'life' ? ShieldCheck : HeartPulse

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`family-coverage-card family-coverage-card--${variant} w-full text-left p-4 transition-all active:scale-[0.99] ${
        summary.policyCount === 0 ? 'opacity-60' : 'hover:shadow-md'
      }`}
      disabled={summary.policyCount === 0}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 family-coverage-card__icon`} />
          <span className="text-xs font-medium family-coverage-card__label">{summary.label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {activeClaimCount > 0 && (
            <span className="m3-chip family-coverage-card__claim-badge">
              {activeClaimCount} 件理賠進行中
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </div>
      </div>
      <p className="family-coverage-card__amount text-xl md:text-2xl font-bold">
        {summary.policyCount > 0 ? formatHeadlineAmount(summary.headlineAmount) : '—'}
      </p>
      <p className="text-[10px] family-coverage-card__note mt-1 leading-relaxed">
        {summary.description}
      </p>
      {summary.policyCount > 0 && (
        <p className="text-[10px] text-gray-500 mt-2">
          {formatMemberHolding(summary.memberNames)} · {summary.policyCount} 張保單
        </p>
      )}
    </button>
  )
}

function CoverageDetailModal({
  summary,
  members,
  isOpen,
  onOpenChange,
}: {
  summary: FamilyCoverageDomainSummary | null
  members: FamilyMember[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyWithMember | null>(null)

  if (!summary) return null

  const variant = summary.domain

  return (
    <>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{summary.label}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <StackBlock>
                <div className={`family-coverage-modal-summary family-coverage-modal-summary--${variant}`}>
                  <p className="text-xs font-medium opacity-80">家庭合計</p>
                  <p className="text-lg font-bold mt-0.5">
                    {formatHeadlineAmount(summary.headlineAmount)}
                    {summary.domain === 'life' ? ' 身故保額' : ' 醫療保額'}
                  </p>
                  <p className="text-[10px] mt-1 opacity-70">
                    {summary.memberCount} 位成員 · {summary.policyCount} 張保單 ·{' '}
                    {summary.subcategories.length} 類保障
                  </p>
                </div>

                {summary.subcategories.map((group) => (
                  <section key={group.subcategoryType}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {group.subcategoryLabel}
                      </p>
                      <p className="text-xs font-semibold text-teal-700 shrink-0">
                        {formatItemAmount(group.totalAmount, group.isMonthly)}
                      </p>
                    </div>
                    <StackList>
                      {group.items.map((item) => {
                        const member = findMemberByPolicyId(members, item.id)
                        const claim = getClaimByPolicyId(members, item.id)
                        return (
                          <CoverageListItem
                            key={item.id}
                            item={item}
                            member={member}
                            claim={claim}
                            formatAmount={(amount, isMonthly) =>
                              formatItemAmount(amount, isMonthly ?? false)
                            }
                            amountClassName={coverageAmountClass(item)}
                            onOpenPolicy={setSelectedPolicy}
                          />
                        )
                      })}
                    </StackList>
                  </section>
                ))}
              </StackBlock>
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

export function FamilyCoverageOverview({ members }: { members: FamilyMember[] }) {
  const domains = useMemo(() => computeFamilyCoverageDomains(members), [members])
  const [activeDomain, setActiveDomain] = useState<FamilyCoverageDomainSummary | null>(null)

  const lifeClaimCount = useMemo(
    () => countActiveClaims(members, domains.life),
    [members, domains.life],
  )
  const medicalClaimCount = useMemo(
    () => countActiveClaims(members, domains.medical),
    [members, domains.medical],
  )

  return (
    <>
      <div className="family-coverage-overview ds-stack-list-loose mt-4">
        <CoverageEntryCard
          summary={domains.life}
          variant="life"
          activeClaimCount={lifeClaimCount}
          onOpen={() => setActiveDomain(domains.life)}
        />
        <CoverageEntryCard
          summary={domains.medical}
          variant="medical"
          activeClaimCount={medicalClaimCount}
          onOpen={() => setActiveDomain(domains.medical)}
        />
      </div>

      <CoverageDetailModal
        summary={activeDomain}
        members={members}
        isOpen={!!activeDomain}
        onOpenChange={(open) => !open && setActiveDomain(null)}
      />
    </>
  )
}