/**
 * 全站間距佈局（M3 4dp grid，語意 token 定義於 index.css :root）
 *
 * PageStack      → --ds-space-page (16px)  頁面主區塊
 * CardSectionTitle / ds-section-header → --ds-space-title-content (8px)  標題→內容
 * StackList      → --ds-space-list (8px)   卡片列表
 * StackList loose→ --ds-space-list-loose (12px) 模態內群組
 * StackForm      → --ds-space-form (12px)  表單欄位
 * StackBlock     → --ds-space-block (16px) 模態主段落
 * ds-stack-tight → --ds-space-tight (4px)  極緊湊列
 */
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

/** 文字按鈕 — 點擊開啟視窗，統一附右箭頭 */
export function TextModalLink({
  children,
  className = '',
  variant = 'default',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary'
}) {
  return (
    <button
      type="button"
      className={`m3-text-modal-link ${
        variant === 'secondary' ? 'm3-text-modal-link--secondary' : ''
      } ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      <ChevronRight className="m3-text-modal-link__icon" aria-hidden />
    </button>
  )
}

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

/** 頁面主區塊垂直節奏（16px） */
export function PageStack({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`ds-page-stack ${className}`.trim()}>{children}</div>
  )
}

/** 單一內容區段容器 */
export function Section({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={`ds-section ${className}`.trim()}>{children}</section>
}

/** 卡片／列表項間距（8px） */
export function StackList({
  children,
  loose = false,
  className = '',
}: {
  children: ReactNode
  loose?: boolean
  className?: string
}) {
  return (
    <div
      className={`${loose ? 'ds-stack-list-loose' : 'ds-stack-list'} ${className}`.trim()}
    >
      {children}
    </div>
  )
}

/** 表單欄位間距（12px） */
export function StackForm({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`ds-stack-form ${className}`.trim()}>{children}</div>
}

/** 模態內主段落間距（16px） */
export function StackBlock({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`ds-stack-block ${className}`.trim()}>{children}</div>
}

/**
 * 區域標題列：全站 12px 大寫灰字，與下方內容固定 8px（--ds-space-title-content）
 */
export function CardSectionTitle({
  children,
  icon: Icon,
  count,
  subtitle,
  actions,
  className = '',
  as: Tag = 'h3',
}: {
  children: ReactNode
  icon?: LucideIcon
  count?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
  as?: 'h2' | 'h3' | 'h4'
}) {
  const headerAlign = subtitle ? 'items-start' : 'items-end'

  return (
    <div
      className={`ds-section-header flex ${headerAlign} justify-between gap-2 ${className}`.trim()}
    >
      <div className="min-w-0 flex-1">
        <Tag
          className={`m3-section-title ${
            Icon ? 'm3-section-title--with-icon' : ''
          }`}
        >
          {Icon ? <Icon className="w-3.5 h-3.5 text-teal-500 shrink-0" /> : null}
          {children}
        </Tag>
        {subtitle ? <p className="ds-section-subtitle">{subtitle}</p> : null}
      </div>
      {actions ?? (count != null ? (
        <span className="m3-section-meta">{count}</span>
      ) : null)}
    </div>
  )
}

/** 頁面區段：標題 + 內容，間距與字級全站一致 */
export function PageSection({
  title,
  icon,
  count,
  subtitle,
  actions,
  className = '',
  fullWidth = false,
  children,
}: {
  title: ReactNode
  icon?: LucideIcon
  count?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
  fullWidth?: boolean
  children: ReactNode
}) {
  return (
    <Section
      className={`${fullWidth ? 'overview-grid--full' : ''} ${className}`.trim()}
    >
      <CardSectionTitle
        icon={icon}
        count={count}
        subtitle={subtitle}
        actions={actions}
      >
        {title}
      </CardSectionTitle>
      {children}
    </Section>
  )
}

export function FormLabel({
  children,
  className = '',
  htmlFor,
}: {
  children: ReactNode
  className?: string
  htmlFor?: string
}) {
  return (
    <label htmlFor={htmlFor} className={`m3-field-label ${className}`.trim()}>
      {children}
    </label>
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

/** 三欄卡片列：內容 80% · 指標 15% · 箭頭 5% */
export function CardItemTriRow({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`m3-card-item__row--tri ${className}`.trim()}>
      {children}
    </div>
  )
}

export function CardItemTriMain({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`m3-card-item__tri-main ${className}`.trim()}>{children}</div>
}

export function CardItemTriIndicator({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`m3-card-item__tri-indicator ${className}`.trim()}>{children}</div>
  )
}

export function CardItemTriAction({
  children,
  className = '',
}: {
  children?: ReactNode
  className?: string
}) {
  return <div className={`m3-card-item__tri-action ${className}`.trim()}>{children}</div>
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
      <p className="text-base text-gray-700">{title}</p>
      {description ? <p className="text-sm text-gray-500 mt-1">{description}</p> : null}
    </CardItem>
  )
}