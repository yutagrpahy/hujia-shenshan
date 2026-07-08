interface BrandHeaderProps {
  memberCount: number
  variant?: 'mobile' | 'desktop'
}

export function BrandHeader({ memberCount, variant = 'mobile' }: BrandHeaderProps) {
  const isDesktop = variant === 'desktop'

  return (
    <div className={`brand-header ${isDesktop ? 'brand-header--desktop' : 'brand-header--mobile'}`}>
      <div className="brand-header__title-row">
        <h1 className="brand-wordmark">護家神山</h1>
        <p className="brand-tagline">全家一起守護，才是真保障</p>
      </div>
      <p className="brand-caption">王建國家庭 · {memberCount} 位成員</p>
    </div>
  )
}