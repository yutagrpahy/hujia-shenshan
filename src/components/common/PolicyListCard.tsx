import { getClaimByPolicyId, CLAIM_STATUS_GROUP } from '../../data/claims'
import { getPolicyStatusChip } from '../../data/policyLabels'
import { getPolicyParties } from '../../data/policyDetails'
import type { FamilyMember, Policy, PolicyWithMember } from '../../types'
import { PolicySourceLabel } from './PolicySourceLabel'
import { ClaimProgressRing, claimRingTone } from './ClaimProgressRing'
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
  CardItemTriIndicator,
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
  const statusChip = getPolicyStatusChip(policy)

  const content = (
    <CardItemTriRow>
      <CardItemTriMain>
        {showIdentity ? (
          <CardItemMeta>
            <MemberAvatar name={memberName} seed={resolvedAvatarSeed} size="sm" />
            <CardItemMetaLabel>{memberName}</CardItemMetaLabel>
            {hasClaim ? (
              <span className={`m3-chip claim-chip claim-chip--${statusTone} shrink-0`}>
                {claim.statusLabel}
              </span>
            ) : null}
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
          {!hasClaim && statusChip ? (
            <span className={`m3-chip ${statusChip.className}`}>{statusChip.label}</span>
          ) : null}
        </CardItemTags>
      </CardItemTriMain>

      {hasClaim ? (
        <CardItemTriIndicator>
          <ClaimProgressRing
            progress={claim.progress}
            tone={claimRingTone(claim.claimStatus, claim.isError)}
            size={44}
            label={`${claim.progress}%`}
          />
        </CardItemTriIndicator>
      ) : null}

      <CardItemTriAction>{onClick ? <CardItemChevron /> : null}</CardItemTriAction>
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