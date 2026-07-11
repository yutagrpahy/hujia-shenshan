import { Button, Spinner } from '@heroui/react'
import { AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { BrandLogo } from './BrandLogo'
import { HealthProfileModal } from './HealthProfilePanel'

interface EmptyStateProps {
  onSetup: () => void
}

export function EmptyState({ onSetup }: EmptyStateProps) {
  const { protectionProfile, updateProtectionProfile } = useApp()
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)

  const handleQuestionnaireSave = (profile: typeof protectionProfile) => {
    updateProtectionProfile(profile)
    onSetup()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70dvh] px-6 text-center">
      <BrandLogo size={80} variant="mark" className="mb-6" />
      <h1 className="text-xl font-semibold text-teal-700 mb-2">歡迎來到護家神山</h1>
      <p className="text-base text-gray-600 max-w-xs mb-2 leading-relaxed">
        讓我們一起為您的家庭建立專屬的保障地圖，視覺化每位家人的保障狀況。
      </p>
      <p className="text-sm text-teal-700 mb-8">
        保障規劃，是給家人最溫暖的禮物
      </p>
      <Button size="lg" className="btn-accent" onPress={() => setShowQuestionnaire(true)}>
        <Sparkles className="w-5 h-5" />
        開始填寫保障生活問卷
      </Button>

      <HealthProfileModal
        isOpen={showQuestionnaire}
        onOpenChange={setShowQuestionnaire}
        profile={protectionProfile}
        onSave={handleQuestionnaireSave}
        mode="onboarding"
      />
    </div>
  )
}

export function LoadingOverlay({ message = 'AI 模擬計算中...' }: { message?: string }) {
  return (
    <div
      className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 m3-panel"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size="lg" aria-hidden />
      <p className="text-base font-semibold text-teal-700">{message}</p>
    </div>
  )
}

export function SuccessBanner({
  title = '更新成功',
  message = '已通知相關家庭成員',
}: {
  title?: string
  message?: string
}) {
  return (
    <div className="m3-card-filled p-3 flex items-center gap-3 mb-4" role="status" aria-live="polite">
      <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" aria-hidden />
      <div>
        <p className="text-base font-semibold text-teal-800">{title}</p>
        <p className="text-sm text-teal-700">{message}</p>
      </div>
    </div>
  )
}

export function ErrorBanner({
  message = '資料同步發生衝突，請重新整理。',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="m3-card p-4 border-red-200 bg-red-50 flex items-start gap-3 mb-4" role="alert">
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" aria-hidden />
      <div className="flex-1">
        <p className="text-base font-semibold text-red-800">資料衝突</p>
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" onPress={onRetry}>
          重試
        </Button>
      )}
    </div>
  )
}