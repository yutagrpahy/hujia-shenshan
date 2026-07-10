import { ROLE_LABELS } from '../../data/mockData'
import type { FamilyMember } from '../../types'

export function UserHeaderMeta({
  user,
  memberCount,
  compact = false,
}: {
  user: FamilyMember
  memberCount: number
  compact?: boolean
}) {
  const roleLabel = ROLE_LABELS[user.role] ?? '家庭成員'
  const familyLabel = `${roleLabel} · ${memberCount} 位成員`

  if (compact) {
    return (
      <div className="user-header-meta user-header-meta--compact min-w-0">
        <span className="user-header-meta__name truncate">{user.name}</span>
        <span className="user-header-meta__family truncate">{familyLabel}</span>
      </div>
    )
  }

  return (
    <div className="user-header-meta min-w-0">
      <span className="user-header-meta__name">{user.name}</span>
      <span className="user-header-meta__family">{familyLabel}</span>
    </div>
  )
}