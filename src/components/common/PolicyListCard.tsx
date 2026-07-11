import { getClaimByPolicyId, CLAIM_STATUS_GROUP } from '../../data/claims'
import { getPolicyCardStatusChip } from '../../data/policyLabels'
import { getPolicyParties } from '../../data/policyDetails'
import type { FamilyMember, Policy, PolicyWithMember } from '../../types'
import { PolicySourceLabel } from './PolicySourceLabel'
import { ClaimProgressSlot } from './ClaimProgressRing'
import {
  CardItem,
  CardItemChevron,
  CardItemDetail,
  CardItemMeta,
  CardItemMetaLabel,
  CardItemSubtitle,
  CardItemTags,
  CardItemTitle,
  CardItemTriAction,
  CardItemTriMain,
  CardItemTriRow,
} from './CardLayout'
import { MemberAvatar } from './MemberAvatar'

export function PolicyListCard({
  policy,
  memberName,
  memberId,
  avatarSeed,
  members,
  showMember = true,
  highlighted = false,
  onClick,
  id,
  className = '',
}: {
  policy: Policy
  memberName?: string
  memberId?: string
  avatarSeed?: string
  members?: FamilyMember[]
  showMember?: boolean
  highlighted?: boolean
  onClick?: () => void
  id?: string
  className?: string
}) {
  const claim = members ? getClaimByPolicyId(members, policy.id) : undefined
  const hasClaim = !!claim
  const statusTone = hasClaim ? CLAIM_STATUS_GROUP[claim.claimStatus].tone : null
  const parties =
    members && memberId
      ? getPolicyParties(members, memberId)
      : memberName
        ? { proposer: memberName, insured: memberName }
        : null
  const resolvedAvatarSeed = avatarSeed ?? memberName
  const showIdentity = showMember && memberName && resolvedAvatarSeed
  const statusChip = getPolicyCardStatusChip(policy, claim)

  const content = (
    <CardItemTriRow>
      <CardItemTriMain>
        {showIdentity ? (
          <CardItemMeta>
            <MemberAvatar name={memberName} seed={resolvedAvatarSeed} size="sm" />
            <CardItemMetaLabel>{memberName}</CardItemMetaLabel>
          </CardItemMeta>
        ) : null}
        <CardItemTitle>{policy.name}</CardItemTitle>
        <CardItemSubtitle>{policy.insurer}</CardItemSubtitle>
        {parties ? (
          <CardItemDetail>
            要保人 {parties.proposer} · 被保人 {parties.insured}
          </CardItemDetail>
        ) : null}
        <CardItemTags>
          <PolicySourceLabel source={policy.source} />
          {statusChip ? (
            <span className={`m3-chip shrink-0 ${statusChip.className}`}>{statusChip.label}</span>
          ) : null}
        </CardItemTags>
      </CardItemTriMain>

      <ClaimProgressSlot claim={claim} />

      {onClick ? (
        <CardItemTriAction>
          <CardItemChevron />
        </CardItemTriAction>
      ) : null}
    </CardItemTriRow>
  )

  if (!onClick) {
    return (
      <CardItem className={`mb-2 ${className}`.trim()}>{content}</CardItem>
    )
  }

  return (
    <CardItem
      as="button"
      interactive
      id={id}
      className={`mb-2 scroll-mt-28 ${
        highlighted ? 'member-policy-card--highlight' : ''
      } ${hasClaim ? `claim-card claim-card--${statusTone}` : ''} ${className}`.trim()}
      onClick={onClick}
    >
      {content}
    </CardItem>
  )
}

export function PolicyListCardFromItem({
  item,
  members,
  showMember = true,
  highlighted = false,
  onSelect,
  className = '',
}: {
  item: PolicyWithMember
  members?: FamilyMember[]
  showMember?: boolean
  highlighted?: boolean
  onSelect: (item: PolicyWithMember) => void
  className?: string
}) {
  return (
    <PolicyListCard
      policy={item.policy}
      memberName={item.memberName}
      memberId={item.memberId}
      avatarSeed={item.avatarSeed}
      members={members}
      showMember={showMember}
      highlighted={highlighted}
      onClick={() => onSelect(item)}
      className={className}
    />
  )
}