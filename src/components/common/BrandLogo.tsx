import { publicAsset } from '../../utils/publicAsset'

const APP_ICON = publicAsset('/app-icon.png')

interface BrandLogoProps {
  size?: number
  className?: string
}

export function BrandLogo({ size = 44, className = '' }: BrandLogoProps) {
  return (
    <img
      src={APP_ICON}
      alt="護家神山"
      width={size}
      height={size}
      className={`rounded-[22%] object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  )
}