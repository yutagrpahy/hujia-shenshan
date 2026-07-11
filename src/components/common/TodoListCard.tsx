import type { ReactNode } from 'react'
import {
  CardItem,
  CardItemChevron,
  CardItemDetail,
  CardItemHead,
  CardItemMain,
  CardItemRow,
  CardItemTags,
  CardItemTitle,
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
    <CardItem variant="muted" className={`m3-card-item--lg ${className}`.trim()}>
      <CardItemRow>
        {leading}
        <button type="button" onClick={onClick} className="flex-1 min-w-0 text-left">
          <CardItemMain>
            <CardItemHead>
              <CardItemTitle className="font-semibold text-gray-700">
                {title}
              </CardItemTitle>
              <CardItemChevron className="mt-0.5" />
            </CardItemHead>
            {detail ? (
              <CardItemDetail className="text-gray-500 text-xs mb-2 line-clamp-2">
                {detail}
              </CardItemDetail>
            ) : null}
            <CardItemTags>{tags}</CardItemTags>
          </CardItemMain>
        </button>
      </CardItemRow>
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
      onClick={onClick}
      className="w-6 h-6 rounded-full border-2 border-teal-400 flex items-center justify-center shrink-0 mt-0.5 active:bg-teal-50"
      aria-label={label}
    />
  )
}