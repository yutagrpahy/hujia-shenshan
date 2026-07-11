import {
  POLICY_STATUS_BADGES,
  POLICY_STATUS_LABELS,
  POLICY_TYPE_LABELS,
} from '../../data/policyLabels'
import { getPolicyParties } from '../../data/policyDetails'
import type { FamilyMember, Policy, PolicyWithMember } from '../../types'
import { PolicySourceLabel } from './PolicySourceLabel'
import {
  CardItem,
  CardItemChevron,
  CardItemDetail,
  CardItemHead,
  CardItemMain,
  CardItemMeta,
  CardItemMetaLabel,
  CardItemRow,
  CardItemSubtitle,
  CardItemTags,
  CardItemTitle,
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
  const parties =
    members && memberId
      ? getPolicyParties(members, memberId)
      : memberName
        ? { proposer: memberName, insured: memberName }
        : null

  const content = (
    <CardItemRow>
      <CardItemMain>
        {showMember && memberName && avatarSeed ? (
          <CardItemMeta>
            <MemberAvatar name={memberName} seed={avatarSeed} size="xs" />
            <CardItemMetaLabel>{memberName}</CardItemMetaLabel>
          </CardItemMeta>
        ) : null}
        <CardItemHead>
          <div className="min-w-0 flex-1">
            <CardItemTitle>{policy.name}</CardItemTitle>
            <CardItemSubtitle>{policy.insurer}</CardItemSubtitle>
          </div>
          <span className="m3-chip bg-teal-50 text-teal-600 shrink-0">
            {POLICY_TYPE_LABELS[policy.type]}
          </span>
        </CardItemHead>
        {parties ? (
          <CardItemDetail>
            要保人 {parties.proposer} · 被保人 {parties.insured}
          </CardItemDetail>
        ) : null}
        <CardItemTags>
          <PolicySourceLabel source={policy.source} />
          {policy.status !== 'active' && POLICY_STATUS_BADGES[policy.status] && (
            <span className={`m3-chip ${POLICY_STATUS_BADGES[policy.status]}`}>
              {POLICY_STATUS_LABELS[policy.status]}
            </span>
          )}
        </CardItemTags>
      </CardItemMain>
      {onClick ? <CardItemChevron className="mt-1" /> : null}
    </CardItemRow>
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
      } ${className}`.trim()}
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