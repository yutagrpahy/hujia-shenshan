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
}: MemberAvatarProps) {
  return (
    <img
      src={getMemberAvatarUrl(seed, index)}
      alt={`${name} 的頭像`}
      className={`member-avatar ${SIZES[size]} ${TONE_CLASSES[tone]} ${className}`}
      loading="lazy"
    />
  )
}