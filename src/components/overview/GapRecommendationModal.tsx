import { Modal } from '@heroui/react'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { useApp } from '../../context/AppContext'
import type { CoverageGap } from '../../types'
import { getGapRecommendations } from '../../utils/calculations'
import { PolicyRecommendationPanel } from '../common/PolicyRecommendationPanel'

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
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const result = gap ? getGapRecommendations(gap, protectionProfile) : null

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{gap?.category} · AI 推薦</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {result && (
              <PolicyRecommendationPanel
                breakdown={result.breakdown}
                narrative={result.narrative}
                recommendations={result.recommendations}
                recommendedAdvisor={result.recommendedAdvisor}
              />
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}