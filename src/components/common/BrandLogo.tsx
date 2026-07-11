import { publicAsset } from '../../utils/publicAsset'

const APP_ICON_MARK = publicAsset('/app-icon-mark.png')
const APP_ICON = publicAsset('/app-icon.png')

interface BrandLogoProps {
  size?: number
  className?: string
  /** mark＝透明底圖章（頂部導覽）；app＝完整 App 圖示 */
  variant?: 'mark' | 'app'
}

export function BrandLogo({
  size = 44,
  className = '',
  variant = 'mark',
}: BrandLogoProps) {
  const src = variant === 'mark' ? APP_ICON_MARK : APP_ICON

  return (
    <span
      className={`brand-logo ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        className="brand-logo__img"
        width={size}
        height={size}
        decoding="async"
      />
    </span>
  )
}