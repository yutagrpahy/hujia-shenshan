import {
  CardItem,
  CardItemAmount,
  CardItemChevron,
  CardItemSubtitle,
  CardItemTitle,
} from './CardLayout'

export function GroupSummaryCard({
  title,
  subtitle,
  amount,
  onClick,
  variant = 'warm',
  className = '',
}: {
  title: string
  subtitle: string
  amount: string
  onClick: () => void
  variant?: 'warm' | 'nested'
  className?: string
}) {
  return (
    <CardItem
      as="button"
      interactive
      variant={variant}
      className={className}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <CardItemTitle>{title}</CardItemTitle>
          <CardItemSubtitle className="text-[10px] text-gray-400">
            {subtitle}
          </CardItemSubtitle>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CardItemAmount>{amount}</CardItemAmount>
          <CardItemChevron />
        </div>
      </div>
    </CardItem>
  )
}