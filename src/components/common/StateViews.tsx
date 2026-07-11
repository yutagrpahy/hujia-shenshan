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
      <h2 className="text-xl font-semibold text-teal-700 mb-2">歡迎來到護家神山</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-2 leading-relaxed">
        讓我們一起為您的家庭建立專屬的保障地圖，視覺化每位家人的保障狀況。
      </p>
      <p className="text-xs text-teal-600 mb-8">
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
    <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 rounded-2xl">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-teal-600">{message}</p>
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
    <div className="m3-card-filled p-3 flex items-center gap-3 mb-4">
      <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
      <div>
        <p className="text-sm font-medium text-teal-700">{title}</p>
        <p className="text-xs text-teal-600">{message}</p>
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
    <div className="m3-card p-4 border-red-200 bg-red-50 flex items-start gap-3 mb-4">
      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-700">資料衝突</p>
        <p className="text-xs text-red-500">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="secondary" onPress={onRetry}>
          重試
        </Button>
      )}
    </div>
  )
}