import { ArrowRight, FlaskConical, MessageSquare } from 'lucide-react'
import { getAdvisorAvatarUrl } from '../../utils/avatars'

const CHAT_FEATURES = [
  '即時問答保障疑問',
  '個人化保單建議',
  '稅務、長照、遺產',
]

const SIMULATE_FEATURES = [
  '失能、長照、身故',
  '試算缺口與月給付',
  '選成員一鍵分析',
]

export function AdvisorWelcome({
  onEnterChat,
  onEnterSimulate,
}: {
  onEnterChat: () => void
  onEnterSimulate: () => void
}) {
  return (
    <div className="flex flex-col items-center py-4 px-1 max-w-lg mx-auto w-full min-h-0">
      <img
        src={getAdvisorAvatarUrl()}
        alt="AI 顧問"
        className="advisor-avatar advisor-avatar--hero w-12 h-12 mb-3"
      />
      <h3 className="text-base font-bold text-gray-800 mb-1">護家神山 AI 保障顧問</h3>
      <p className="advisor-landing-intro text-center leading-relaxed mb-5 px-2">
        選擇功能，快速開始
      </p>

      <div className="advisor-landing-grid w-full">
        <button
          type="button"
          onClick={onEnterChat}
          className="advisor-landing-card advisor-landing-card--chat text-left"
        >
          <div className="advisor-landing-card__icon advisor-landing-card__icon--chat">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <p className="advisor-landing-card__title mt-3">對話</p>
          <p className="advisor-landing-card__desc mt-1 leading-relaxed">
            提問釐清保障
          </p>
          <ul className="advisor-landing-card__features mt-3 space-y-2 flex-1">
            {CHAT_FEATURES.map((feature) => (
              <li key={feature} className="advisor-landing-card__feature flex gap-1.5">
                <span className="text-teal-500 shrink-0">·</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <span className="advisor-landing-card__cta mt-3">
            開始對話
            <ArrowRight className="advisor-landing-card__cta-icon" />
          </span>
        </button>

        <button
          type="button"
          onClick={onEnterSimulate}
          className="advisor-landing-card advisor-landing-card--simulate text-left"
        >
          <div className="advisor-landing-card__icon advisor-landing-card__icon--simulate">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <p className="advisor-landing-card__title mt-3">情境模擬</p>
          <p className="advisor-landing-card__desc mt-1 leading-relaxed">
            試算事件衝擊
          </p>
          <ul className="advisor-landing-card__features mt-3 space-y-2 flex-1">
            {SIMULATE_FEATURES.map((feature) => (
              <li key={feature} className="advisor-landing-card__feature flex gap-1.5">
                <span className="text-coral-500 shrink-0">·</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <span className="advisor-landing-card__cta mt-3">
            開始模擬
            <ArrowRight className="advisor-landing-card__cta-icon" />
          </span>
        </button>
      </div>
    </div>
  )
}