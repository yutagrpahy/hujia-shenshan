import { FlaskConical, MessageCircle, Sparkles } from 'lucide-react'
import { getAdvisorAvatarUrl } from '../../utils/avatars'
import { AI_SUGGESTIONS, SCENARIO_LABELS } from '../../data/mockData'
import type { ScenarioEventType } from '../../types'
import { SCENARIO_OPTIONS, ScenarioQuickCards } from './ScenarioSimulatorSheet'

const SCENARIO_HINTS: Record<ScenarioEventType, string> = {
  disability: '估算失能後每月缺口',
  'longterm-care': '檢視長照月給付是否足夠',
  death: '試算身故保額與家庭支出',
  accident: '評估意外理賠覆蓋率',
  retirement: '預覽退休後收入替代',
}

export function AdvisorWelcome({
  onSelectScenario,
  onSuggest,
}: {
  onSelectScenario: (event: ScenarioEventType) => void
  onSuggest: (text: string) => void
}) {
  return (
    <div className="flex flex-col items-center py-6 px-2 max-w-lg mx-auto w-full">
      <img
        src={getAdvisorAvatarUrl()}
        alt="AI 顧問"
        className="w-14 h-14 rounded-2xl ring-4 ring-teal-50 mb-4"
      />
      <h3 className="text-base font-bold text-gray-800 mb-1">護家神山 AI 保障顧問</h3>
      <p className="text-xs text-gray-500 text-center leading-relaxed mb-6">
        分析家庭保障缺口、模擬人生事件，或隨時提問規劃建議
      </p>

      <div className="w-full advisor-feature-card mb-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">情境模擬</p>
            <p className="text-[10px] text-gray-400">常駐功能 · 選成員與情境即可試算</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {SCENARIO_OPTIONS.slice(0, 4).map((ev) => (
            <button
              key={ev}
              type="button"
              onClick={() => onSelectScenario(ev)}
              className="advisor-scenario-card text-left p-3"
            >
              <p className="text-xs font-semibold text-teal-700">{SCENARIO_LABELS[ev]}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{SCENARIO_HINTS[ev]}</p>
            </button>
          ))}
        </div>
        <ScenarioQuickCards onSelect={onSelectScenario} />
      </div>

      <div className="w-full">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          或從這些問題開始
        </p>
        <div className="grid grid-cols-1 gap-2">
          {AI_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggest(s)}
              className="advisor-prompt-card text-left px-3.5 py-3 text-sm text-gray-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-500 inline mr-1.5 -mt-0.5" />
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}