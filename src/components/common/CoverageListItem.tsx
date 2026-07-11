import { AlertCircle } from 'lucide-react'
import type { ClaimRecord, FamilyMember, PolicyWithMember } from '../../types'
import { ClaimProgressRing, claimRingTone } from './ClaimProgressRing'
import {
  CardItem,
  CardItemAction,
  CardItemAmount,
  CardItemAside,
  CardItemChevron,
  CardItemDetail,
  CardItemMain,
  CardItemMeta,
  CardItemMetaLabel,
  CardItemRow,
  CardItemSubtitle,
  CardItemTitle,
} from './CardLayout'
import { MemberAvatar } from './MemberAvatar'

export interface CoverageListItemData {
  id: string
  memberName: string
  policyName: string
  insurer: string
  amount: number
  isMonthly?: boolean
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
  const isClickable = !!onOpenPolicy && !!member && !!policy

  const actionLabel = hasClaim && claim.isError ? '查看保單' : hasClaim ? '理賠詳情' : '查看保單'

  const content = (
    <CardItemRow>
      <div className="m3-card-item__media relative">
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
          <div className="m3-icon-wrap m3-icon-wrap--sm" />
        )}
      </div>
      <CardItemMain>
        <CardItemMeta>
          <CardItemMetaLabel>{item.memberName}</CardItemMetaLabel>
          {hasClaim ? (
            <span
              className={`m3-chip shrink-0 ${
                claim.isError
                  ? 'bg-red-50 text-red-600'
                  : claim.claimStatus === 'in_review'
                    ? 'bg-teal-50 text-teal-600'
                    : 'bg-amber-50 text-amber-600'
              }`}
            >
              {claim.isError ? (
                <AlertCircle className="w-3 h-3 inline mr-0.5 -mt-0.5" />
              ) : null}
              {claim.statusLabel}
            </span>
          ) : null}
        </CardItemMeta>
        <CardItemTitle>{item.policyName}</CardItemTitle>
        <CardItemSubtitle>{item.insurer}</CardItemSubtitle>
        {hasClaim ? (
          <CardItemDetail className="text-gray-500 line-clamp-2">
            {claim.statusSummary}
          </CardItemDetail>
        ) : null}
      </CardItemMain>
      <CardItemAside>
        <CardItemAmount className={amountClassName}>
          {formatAmount(item.amount, item.isMonthly)}
        </CardItemAmount>
        {isClickable ? (
          <>
            <CardItemAction>{actionLabel}</CardItemAction>
            <CardItemChevron />
          </>
        ) : null}
      </CardItemAside>
    </CardItemRow>
  )

  if (!isClickable) {
    return <CardItem>{content}</CardItem>
  }

  return (
    <CardItem
      as="button"
      interactive
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