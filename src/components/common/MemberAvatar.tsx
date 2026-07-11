import type { CSSProperties } from 'react'
import type { FamilyMember } from '../../types'
import { getMemberAvatarUrl } from '../../utils/avatars'

interface MemberAvatarProps {
  name: string
  seed: string
  index?: number
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** covered＝有效保障（綠色）、uncovered＝未持有（灰色） */
  tone?: 'default' | 'covered' | 'uncovered'
  className?: string
}

const SIZES = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
}

const TONE_CLASSES = {
  default: 'member-avatar--default',
  covered: 'member-avatar--covered',
  uncovered: 'member-avatar--uncovered',
}

export function MemberAvatar({
  name,
  seed,
  index = 0,
  size = 'md',
  tone = 'default',
  className = '',
  style,
}: MemberAvatarProps & { style?: CSSProperties }) {
  return (
    <img
      src={getMemberAvatarUrl(seed, index)}
      alt={`${name} 的頭像`}
      className={`member-avatar ${SIZES[size]} ${TONE_CLASSES[tone]} ${className}`}
      style={style}
      loading="lazy"
    />
  )
}

export function MemberAvatarStack({
  members,
  size = 'sm',
  className = '',
  maxVisible = 8,
}: {
  members: FamilyMember[]
  size?: MemberAvatarProps['size']
  className?: string
  maxVisible?: number
}) {
  const visible = members.slice(0, maxVisible)
  const overflow = members.length - visible.length

  if (visible.length === 0) return null

  return (
    <div
      className={`member-avatar-stack ${className}`.trim()}
      role="group"
      aria-label={`家庭成員 ${members.length} 人`}
    >
      {visible.map((member, index) => (
        <MemberAvatar
          key={member.id}
          name={member.name}
          seed={member.avatarSeed}
          size={size}
          className="member-avatar-stack__item"
          style={{ zIndex: index + 1 }}
        />
      ))}
      {overflow > 0 ? (
        <span className="member-avatar-stack__overflow" style={{ zIndex: visible.length + 1 }}>
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}