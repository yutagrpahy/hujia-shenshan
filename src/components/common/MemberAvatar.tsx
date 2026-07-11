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
  xs: 'w-5 h-5',
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
}

const TONE_CLASSES = {
  default: 'bg-teal-50 ring-2 ring-white',
  covered: 'bg-emerald-50 ring-2 ring-emerald-400 ring-offset-1',
  uncovered: 'bg-gray-100 ring-2 ring-gray-300 grayscale opacity-60',
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
      className={`${SIZES[size]} rounded-2xl object-cover shadow-sm ${TONE_CLASSES[tone]} ${className}`}
      loading="lazy"
    />
  )
}