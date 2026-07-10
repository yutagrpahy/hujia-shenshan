interface BrandHeaderProps {
  variant?: 'mobile' | 'desktop'
}

export function BrandHeader({ variant = 'mobile' }: BrandHeaderProps) {
  const isDesktop = variant === 'desktop'

  return (
    <div
      className={`brand-header min-w-0 ${
        isDesktop ? 'brand-header--desktop' : 'brand-header--mobile'
      }`}
    >
      <h1 className="brand-wordmark">護家神山</h1>
      <p className="brand-tagline">全家一起守護，才是真保障</p>
    </div>
  )
}