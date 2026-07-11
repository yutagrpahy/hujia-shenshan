import { Button, Modal, Spinner } from '@heroui/react'
import { Phone } from 'lucide-react'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type { AdvisorRecommendation, GapBreakdownDisplay, ProductRecommendation } from '../../types'
import { PolicyRecommendationPanel } from './PolicyRecommendationPanel'

export interface RecommendationResult {
  breakdown?: GapBreakdownDisplay
  narrative: string
  recommendations: ProductRecommendation[]
  recommendedAdvisor: AdvisorRecommendation
}

export function RecommendationResultModal({
  isOpen,
  onOpenChange,
  title,
  subtitle,
  result,
  isLoading = false,
  loadingLabel = 'AI 推薦計算中...',
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  result: RecommendationResult | null
  isLoading?: boolean
  loadingLabel?: string
}) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const advisor = result?.recommendedAdvisor

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container
        size="lg"
        placement={isMobile ? 'bottom' : 'center'}
        scroll="inside"
      >
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
            {subtitle ? (
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{subtitle}</p>
            ) : null}
          </Modal.Header>
          <Modal.Body>
            {isLoading ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <Spinner size="lg" />
                <p className="text-sm text-teal-600">{loadingLabel}</p>
              </div>
            ) : result ? (
              <PolicyRecommendationPanel
                breakdown={result.breakdown}
                narrative={result.narrative}
                recommendations={result.recommendations}
                recommendedAdvisor={result.recommendedAdvisor}
              />
            ) : null}
          </Modal.Body>
          {result && !isLoading && advisor ? (
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                關閉
              </Button>
              <Button
                className="btn-accent"
                onPress={() => {
                  window.location.href = `tel:${advisor.phone.replace(/-/g, '')}`
                }}
              >
                <Phone className="w-4 h-4" />
                聯絡 {advisor.name}
              </Button>
            </Modal.Footer>
          ) : null}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}