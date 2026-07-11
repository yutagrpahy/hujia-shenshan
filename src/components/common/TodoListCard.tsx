import type { ReactNode } from 'react'
import {
  CardItem,
  CardItemChevron,
  CardItemDetail,
  CardItemMain,
  CardItemTags,
  CardItemTitle,
  CardItemTriAction,
  CardItemTriIndicator,
  CardItemTriMain,
  CardItemTriRow,
} from './CardLayout'

export function TodoListCard({
  title,
  detail,
  tags,
  leading,
  onClick,
  className = '',
}: {
  title: string
  detail?: string
  tags: ReactNode
  leading?: ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <CardItem
      as="button"
      interactive
      variant="muted"
      className={`m3-card-item--lg ${className}`.trim()}
      onClick={onClick}
    >
      <CardItemTriRow>
        <CardItemTriMain>
          <CardItemMain>
            <CardItemTitle className="font-semibold text-gray-700">{title}</CardItemTitle>
            {detail ? (
              <CardItemDetail className="text-gray-500 text-xs mb-2 line-clamp-2">
                {detail}
              </CardItemDetail>
            ) : null}
            <CardItemTags>{tags}</CardItemTags>
          </CardItemMain>
        </CardItemTriMain>
        <CardItemTriIndicator>{leading}</CardItemTriIndicator>
        <CardItemTriAction>
          <CardItemChevron />
        </CardItemTriAction>
      </CardItemTriRow>
    </CardItem>
  )
}

export function TodoCompleteButton({
  onClick,
  label,
}: {
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className="w-6 h-6 rounded-full border-2 border-teal-400 flex items-center justify-center shrink-0 active:bg-teal-50"
      aria-label={label}
    />
  )
}