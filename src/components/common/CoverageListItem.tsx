import type { ClaimRecord, FamilyMember, PolicyWithMember } from '../../types'
import { CLAIM_STATUS_GROUP } from '../../data/claims'
import { getPolicyCardStatusChip, isPolicyApplicationInProgress } from '../../data/policyLabels'
import { ClaimProgressSlot } from './ClaimProgressRing'
import {
  CardItem,
  CardItemChevron,
  CardItemDetail,
  CardItemMeta,
  CardItemMetaLabel,
  CardItemSubtitle,
  CardItemTitle,
  CardItemTriAction,
  CardItemTriMain,
  CardItemTriRow,
} from './CardLayout'
import { MemberAvatar } from './MemberAvatar'

export interface CoverageListItemData {
  id: string
  memberId?: string
  memberName: string
  avatarSeed?: string
  policyName: string
  insurer: string
  amount: number
  isMonthly?: boolean
  categoryLabel?: string
}

export function CoverageListItem({
  item,
  member,
  claim,
  formatAmount,
  amountClassName = 'text-teal-700',
  onOpenPolicy,
}: {
  item: CoverageListItemData
  member?: FamilyMember
  claim?: ClaimRecord
  formatAmount: (amount: number, isMonthly?: boolean | undefined) => string
  amountClassName?: string
  onOpenPolicy?: (payload: PolicyWithMember) => void
}) {
  const hasClaim = !!claim
  const policy = member?.policies.find((entry) => entry.id === item.id)
  const applicationInProgress = policy ? isPolicyApplicationInProgress(policy) : false
  const isClickable = !!onOpenPolicy && !!member && !!policy
  const memberName = member?.name ?? item.memberName
  const avatarSeed =
    member?.avatarSeed ??
    item.avatarSeed ??
    claim?.avatarSeed ??
    item.memberName
  const statusTone = hasClaim ? CLAIM_STATUS_GROUP[claim.claimStatus].tone : null
  const amountLabel = item.isMonthly ? '月給付' : '保額'
  const formattedAmount = formatAmount(item.amount, item.isMonthly)
  const statusChip = policy ? getPolicyCardStatusChip(policy, claim) : null

  const content = (
    <CardItemTriRow>
      <CardItemTriMain>
        <CardItemMeta>
          <MemberAvatar name={memberName} seed={avatarSeed} size="sm" />
          <CardItemMetaLabel>{memberName}</CardItemMetaLabel>
          {statusChip ? (
            <span className={`m3-chip shrink-0 ${statusChip.className}`}>
              {statusChip.label}
            </span>
          ) : null}
        </CardItemMeta>
        <CardItemTitle>{item.policyName}</CardItemTitle>
        <CardItemSubtitle>
          {item.categoryLabel ? `${item.categoryLabel} · ` : ''}
          {item.insurer}
        </CardItemSubtitle>
        {hasClaim ? (
          <CardItemDetail className="text-gray-500 line-clamp-2">
            {claim.statusSummary}
          </CardItemDetail>
        ) : null}
        <CardItemDetail className={`${amountClassName} font-semibold text-xs mt-1`}>
          {amountLabel} {formattedAmount}
        </CardItemDetail>
      </CardItemTriMain>

      <ClaimProgressSlot claim={claim} policy={policy} />

      {isClickable ? (
        <CardItemTriAction>
          <CardItemChevron />
        </CardItemTriAction>
      ) : null}
    </CardItemTriRow>
  )

  if (!isClickable) {
    return <CardItem>{content}</CardItem>
  }

  return (
    <CardItem
      as="button"
      interactive
      className={
        hasClaim
          ? `claim-card claim-card--${statusTone}`
          : applicationInProgress
            ? 'claim-card claim-card--success'
            : ''
      }
      onClick={() =>
        onOpenPolicy({
          policy: policy!,
          memberId: member!.id,
          memberName: member!.name,
          avatarSeed: member!.avatarSeed,
        })
      }
    >
      {content}
    </CardItem>
  )
}