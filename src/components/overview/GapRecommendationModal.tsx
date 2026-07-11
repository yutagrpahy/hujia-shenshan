import { useApp } from '../../context/AppContext'
import type { CoverageGap } from '../../types'
import { getGapRecommendations } from '../../utils/calculations'
import { RecommendationResultModal } from '../common/RecommendationResultModal'

export function GapRecommendationModal({
  gap,
  isOpen,
  onOpenChange,
}: {
  gap: CoverageGap | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { protectionProfile } = useApp()
  const result = gap ? getGapRecommendations(gap, protectionProfile) : null

  return (
    <RecommendationResultModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={gap ? `${gap.category} · AI 推薦` : 'AI 推薦'}
      subtitle="依家庭保險健康分級與目標保障試算"
      result={result}
    />
  )
}