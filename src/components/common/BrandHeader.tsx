interface BrandHeaderProps {
  memberCount: number
  variant?: 'mobile' | 'desktop'
  /** 手機固定頂部列：僅標準字 + 說明文字 */
  compact?: boolean
}

export function BrandHeader({
  memberCount,
  variant = 'mobile',
  compact = false,
}: BrandHeaderProps) {
  const isDesktop = variant === 'desktop'

  if (compact) {
    return (
      <div className="brand-header brand-header--compact min-w-0">
        <h1 className="brand-wordmark">護家神山</h1>
        <p className="brand-caption">王建國家庭 · {memberCount} 位成員</p>
      </div>
    )
  }

  return (
    <div className={`brand-header min-w-0 ${isDesktop ? 'brand-header--desktop' : 'brand-header--mobile'}`}>
      <div className="brand-header__title-row">
        <h1 className="brand-wordmark">護家神山</h1>
        <p className="brand-tagline">全家一起守護，才是真保障</p>
      </div>
      <p className="brand-caption">王建國家庭 · {memberCount} 位成員</p>
    </div>
  )
}