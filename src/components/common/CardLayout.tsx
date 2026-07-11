import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

type CardItemProps = {
  children: ReactNode
  className?: string
  variant?: 'default' | 'muted' | 'warm' | 'nested'
  interactive?: boolean
} & (
  | ({ as?: 'div' } & HTMLAttributes<HTMLDivElement>)
  | ({ as: 'button' } & ButtonHTMLAttributes<HTMLButtonElement>)
)

const VARIANT_CLASSES = {
  default: '',
  muted: 'bg-sand-50/50',
  warm: 'bg-warm-50',
  nested: 'bg-white/70',
}

export function CardSectionTitle({
  children,
  icon: Icon,
  count,
  className = '',
}: {
  children: ReactNode
  icon?: LucideIcon
  count?: ReactNode
  className?: string
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 mb-2 px-1 ${className}`.trim()}
    >
      <h3
        className={`m3-card-section-title mb-0 px-0 ${
          Icon ? 'm3-card-section-title--with-icon' : ''
        }`}
      >
        {Icon ? <Icon className="w-3.5 h-3.5 text-teal-500 shrink-0" /> : null}
        {children}
      </h3>
      {count != null ? (
        <span className="text-[10px] text-gray-400 shrink-0">{count}</span>
      ) : null}
    </div>
  )
}

export function CardItem({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  as = 'div',
  ...props
}: CardItemProps) {
  const classes = [
    'm3-card',
    'm3-card-item',
    interactive ? 'm3-card-item--clickable' : '',
    VARIANT_CLASSES[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (as === 'button') {
    const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>
    return (
      <button type="button" className={classes} {...buttonProps}>
        {children}
      </button>
    )
  }

  const divProps = props as HTMLAttributes<HTMLDivElement>
  return (
    <div className={classes} {...divProps}>
      {children}
    </div>
  )
}

export function CardItemRow({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`m3-card-item__row ${className}`.trim()}>{children}</div>
}

export function CardItemMedia({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`m3-card-item__media ${className}`.trim()}>{children}</div>
}

export function CardItemMain({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`m3-card-item__main ${className}`.trim()}>{children}</div>
}

export function CardItemMeta({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`m3-card-item__meta ${className}`.trim()}>{children}</div>
}

export function CardItemMetaLabel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`m3-card-item__meta-label truncate ${className}`.trim()}>
      {children}
    </span>
  )
}

export function CardItemHead({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`m3-card-item__head ${className}`.trim()}>{children}</div>
}

export function CardItemTitle({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={`m3-card-item__title truncate ${className}`.trim()}>{children}</p>
}

export function CardItemSubtitle({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={`m3-card-item__subtitle ${className}`.trim()}>{children}</p>
}

export function CardItemDetail({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={`m3-card-item__detail ${className}`.trim()}>{children}</p>
}

export function CardItemTags({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`m3-card-item__tags ${className}`.trim()}>{children}</div>
}

export function CardItemAside({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`m3-card-item__aside ${className}`.trim()}>{children}</div>
}

export function CardItemAmount({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={`m3-card-item__amount ${className}`.trim()}>{children}</p>
}

export function CardItemAction({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={`m3-card-item__action ${className}`.trim()}>{children}</p>
}

export function CardItemChevron({ className = '' }: { className?: string }) {
  return <ChevronRight className={`m3-card-item__chevron ${className}`.trim()} />
}

export function CardEmptyState({
  title,
  description,
  className = '',
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <CardItem className={`m3-card-empty ${className}`.trim()}>
      <p className="text-sm text-gray-500">{title}</p>
      {description ? <p className="text-xs text-gray-400 mt-1">{description}</p> : null}
    </CardItem>
  )
}