import {
  CardItem,
  CardItemAmount,
  CardItemChevron,
  CardItemSubtitle,
  CardItemTitle,
  CardItemTriAction,
  CardItemTriIndicator,
  CardItemTriMain,
  CardItemTriRow,
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
      <CardItemTriRow>
        <CardItemTriMain>
          <CardItemTitle>{title}</CardItemTitle>
          <CardItemSubtitle className="text-[10px] text-gray-400">
            {subtitle}
          </CardItemSubtitle>
        </CardItemTriMain>
        <CardItemTriIndicator>
          <CardItemAmount className="text-center">{amount}</CardItemAmount>
        </CardItemTriIndicator>
        <CardItemTriAction>
          <CardItemChevron />
        </CardItemTriAction>
      </CardItemTriRow>
    </CardItem>
  )
}