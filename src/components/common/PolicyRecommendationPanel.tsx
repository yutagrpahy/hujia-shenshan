import { Calendar, ChevronRight, Phone, Shield, UserCircle } from 'lucide-react'
import type {
  AdvisorRecommendation,
  GapBreakdownDisplay,
  ProductRecommendation,
} from '../../types'
import { formatCurrency } from '../../utils/calculations'
import { CardSectionTitle, PageStack, StackList } from './CardLayout'
import { getAgentAvatarUrl } from '../../utils/avatars'

function GapBreakdownCard({ breakdown }: { breakdown: GapBreakdownDisplay }) {
  const toneClass = (tone?: string) => {
    if (tone === 'gap') return 'text-red-600 font-bold'
    if (tone === 'current') return 'text-teal-700 font-semibold'
    if (tone === 'need' || tone === 'target') return 'text-gray-800 font-semibold'
    return 'text-gray-600'
  }

  return (
    <div className="m3-card-filled p-4 ds-stack-list-loose">
      <div>
        <p className="text-xs font-semibold text-teal-700">{breakdown.category} · 目標保障試算</p>
        <p className="text-[10px] text-gray-400 mt-1">{breakdown.formula}</p>
      </div>
      <StackList>
        {breakdown.rows.map((row) => (
          <div key={row.label} className="flex justify-between items-baseline gap-3 text-sm">
            <span className="text-xs text-gray-500 shrink-0">{row.label}</span>
            <span className={`text-xs text-right ${toneClass(row.tone)}`}>{row.value}</span>
          </div>
        ))}
      </StackList>
      <p className="text-[10px] text-gray-400 leading-relaxed border-t border-teal-100 pt-2">
        {breakdown.profileNote}
      </p>
    </div>
  )
}

export function PolicyRecommendationPanel({
  narrative,
  breakdown,
  recommendations,
  recommendedAdvisor,
}: {
  narrative: string
  breakdown?: GapBreakdownDisplay
  recommendations: ProductRecommendation[]
  recommendedAdvisor: AdvisorRecommendation
}) {
  const gapRow = breakdown?.rows.find((r) => r.tone === 'gap')

  return (
    <PageStack>
      {breakdown && <GapBreakdownCard breakdown={breakdown} />}

      <p className="text-sm text-gray-600 leading-relaxed">{narrative}</p>

      <div>
        <CardSectionTitle
          icon={Shield}
          subtitle={gapRow ? '（針對上述目標保障補強）' : undefined}
        >
          推薦保單
        </CardSectionTitle>
        <StackList>
          {recommendations.map((rec) => (
            <div key={rec.name} className="m3-card p-3 text-sm">
              <div className="flex justify-between mb-0.5 gap-2">
                <span className="font-medium">{rec.name}</span>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {formatCurrency(rec.estimatedPremium)}/月
                </span>
              </div>
              {rec.estimatedBoostLabel && (
                <p className="text-[10px] text-teal-600 font-medium mb-0.5">
                  {rec.estimatedBoostLabel}
                </p>
              )}
              <p className="text-xs text-gray-500">{rec.reason}</p>
              <button
                type="button"
                className="w-full text-left m3-panel border p-3 mt-2.5 transition-colors bg-teal-50 border-teal-100 hover:bg-teal-100/70"
                onClick={() => {
                  window.location.href = `tel:${recommendedAdvisor.phone.replace(/-/g, '')}`
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-teal-700">預約商品諮詢</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  由 {recommendedAdvisor.name} 說明保障內容與保費試算
                </p>
              </button>
            </div>
          ))}
        </StackList>
      </div>

      <div>
        <CardSectionTitle icon={UserCircle}>推薦顧問</CardSectionTitle>
        <div className="m3-card-warm p-4">
          <div className="flex gap-3">
            <img
              src={getAgentAvatarUrl(recommendedAdvisor.name)}
              alt={recommendedAdvisor.name}
              className="member-avatar member-avatar--default w-12 h-12 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{recommendedAdvisor.name}</p>
              <p className="text-xs text-teal-600">{recommendedAdvisor.title}</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                {recommendedAdvisor.reason}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
                <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <a
                  href={`tel:${recommendedAdvisor.phone.replace(/-/g, '')}`}
                  className="hover:underline"
                >
                  {recommendedAdvisor.phone}
                </a>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                服務時間：週一至週五 09:00–18:00
              </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 px-1 leading-relaxed">
          以上為示意推薦，正式版將連結商品試算與預約諮詢流程。
        </p>
      </div>
    </PageStack>
  )
}