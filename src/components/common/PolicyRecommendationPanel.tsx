import { Shield, UserCircle } from 'lucide-react'
import type {
  AdvisorRecommendation,
  GapBreakdownDisplay,
  ProductRecommendation,
} from '../../types'
import { formatCurrency } from '../../utils/calculations'
import { getAdvisorAvatarUrl } from '../../utils/avatars'

function GapBreakdownCard({ breakdown }: { breakdown: GapBreakdownDisplay }) {
  const toneClass = (tone?: string) => {
    if (tone === 'gap') return 'text-red-600 font-bold'
    if (tone === 'current') return 'text-teal-700 font-semibold'
    if (tone === 'need' || tone === 'target') return 'text-gray-800 font-semibold'
    return 'text-gray-600'
  }

  return (
    <div className="m3-card-filled p-4 space-y-3">
      <div>
        <p className="text-xs font-semibold text-teal-700">{breakdown.category} · 缺口試算</p>
        <p className="text-[10px] text-gray-400 mt-1">{breakdown.formula}</p>
      </div>
      <div className="space-y-2">
        {breakdown.rows.map((row) => (
          <div key={row.label} className="flex justify-between items-baseline gap-3 text-sm">
            <span className="text-xs text-gray-500 shrink-0">{row.label}</span>
            <span className={`text-xs text-right ${toneClass(row.tone)}`}>{row.value}</span>
          </div>
        ))}
      </div>
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
    <div className="space-y-4">
      {breakdown && <GapBreakdownCard breakdown={breakdown} />}

      <p className="text-sm text-gray-600 leading-relaxed">{narrative}</p>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          推薦保單
          {gapRow && (
            <span className="text-[10px] text-gray-400 font-normal ml-1">
              （針對上述缺口補強）
            </span>
          )}
        </p>
        {recommendations.map((rec) => (
          <div key={rec.name} className="m3-card p-3 mb-2 text-sm">
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
          </div>
        ))}
      </div>

      <div className="m3-card-warm p-4 flex gap-3">
        <img
          src={getAdvisorAvatarUrl()}
          alt={recommendedAdvisor.name}
          className="w-12 h-12 rounded-2xl ring-2 ring-white shrink-0"
        />
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
            <UserCircle className="w-3.5 h-3.5" />
            推薦顧問
          </p>
          <p className="text-sm font-semibold text-gray-800">{recommendedAdvisor.name}</p>
          <p className="text-xs text-teal-600">{recommendedAdvisor.title}</p>
          <p className="text-xs text-gray-400 mt-1">{recommendedAdvisor.phone}</p>
          <p className="text-xs text-gray-500 mt-2">{recommendedAdvisor.reason}</p>
        </div>
      </div>
    </div>
  )
}