import {
  POLICY_STATUS_BADGES,
  POLICY_STATUS_LABELS,
  POLICY_TYPE_LABELS,
} from '../../data/policyLabels'
import type { Policy, PolicyWithMember } from '../../types'
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
  avatarSeed,
  showMember = true,
  highlighted = false,
  onClick,
  id,
  className = '',
}: {
  policy: Policy
  memberName?: string
  avatarSeed?: string
  showMember?: boolean
  highlighted?: boolean
  onClick?: () => void
  id?: string
  className?: string
}) {
  const content = (
    <CardItemRow>
      <CardItemMain>
        {showMember && memberName && avatarSeed ? (
          <CardItemMeta>
            <MemberAvatar name={memberName} seed={avatarSeed} size="sm" />
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
        <CardItemDetail>
          受益人：{policy.beneficiary} · 到期 {policy.expiryDate}
        </CardItemDetail>
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
  showMember = true,
  highlighted = false,
  onSelect,
  className = '',
}: {
  item: PolicyWithMember
  showMember?: boolean
  highlighted?: boolean
  onSelect: (item: PolicyWithMember) => void
  className?: string
}) {
  return (
    <PolicyListCard
      policy={item.policy}
      memberName={item.memberName}
      avatarSeed={item.avatarSeed}
      showMember={showMember}
      highlighted={highlighted}
      onClick={() => onSelect(item)}
      className={className}
    />
  )
}