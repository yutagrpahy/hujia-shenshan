import { Button } from '@heroui/react'
import { FlaskConical } from 'lucide-react'
import { FormLabel, StackForm, StackList } from '../common/CardLayout'
import { RecommendationResultModal } from '../common/RecommendationResultModal'
import { SCENARIO_LABELS } from '../../data/mockData'
import type { FamilyMember, ScenarioEventType, ScenarioResult } from '../../types'

export const SCENARIO_OPTIONS: ScenarioEventType[] = [
  'disability',
  'longterm-care',
  'death',
  'accident',
  'retirement',
]

const SCENARIO_HINTS: Record<ScenarioEventType, string> = {
  disability: '估算失能後每月待補足額',
  'longterm-care': '檢視長照月給付是否足夠',
  death: '試算身故保額與家庭支出',
  accident: '評估意外理賠覆蓋率',
  retirement: '預覽退休後收入替代',
}

export function ScenarioOptionList({
  selected,
  onSelect,
}: {
  selected?: ScenarioEventType
  onSelect: (event: ScenarioEventType) => void
}) {
  return (
    <StackList>
      {SCENARIO_OPTIONS.map((ev) => (
        <button
          key={ev}
          type="button"
          onClick={() => onSelect(ev)}
          className={`w-full min-h-[var(--a11y-touch-min)] text-left m3-panel border p-3 transition-colors ${
            selected === ev
              ? 'bg-teal-50 border-teal-200'
              : 'bg-white border-sand-200 hover:border-teal-100 hover:bg-sand-50/80'
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              selected === ev ? 'text-teal-700' : 'text-gray-800'
            }`}
          >
            {SCENARIO_LABELS[ev]}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{SCENARIO_HINTS[ev]}</p>
        </button>
      ))}
    </StackList>
  )
}

export function ScenarioSimulatorForm({
  members,
  simMemberId,
  simEvent,
  simAge,
  isSimulating,
  onMemberChange,
  onEventChange,
  onAgeChange,
  onRun,
  compact = false,
}: {
  members: FamilyMember[]
  simMemberId: string
  simEvent: ScenarioEventType
  simAge: number
  isSimulating: boolean
  onMemberChange: (id: string) => void
  onEventChange: (event: ScenarioEventType) => void
  onAgeChange: (age: number) => void
  onRun: () => void
  compact?: boolean
}) {
  const selectedMember = members.find((member) => member.id === simMemberId)

  return (
    <StackForm className={compact ? 'pt-0.5 px-1' : ''}>
      <div className="scenario-sim-controls">
        <div className="scenario-sim-controls__member min-w-0">
          <FormLabel htmlFor="scenario-member-select" className="px-0.5 truncate">
            成員
          </FormLabel>
          <select
            id="scenario-member-select"
            value={simMemberId}
            onChange={(e) => onMemberChange(e.target.value)}
            className="scenario-sim-member-select w-full min-w-0"
            aria-label={`選擇成員，目前為 ${selectedMember?.name ?? ''}`}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="scenario-sim-controls__age min-w-0">
          <FormLabel htmlFor="scenario-age-slider" className="px-0.5">
            發生年齡 · <span className="text-teal-700 font-semibold">{simAge}</span> 歲
          </FormLabel>
          <div className="scenario-age-slider-wrap">
            <input
              id="scenario-age-slider"
              type="range"
              min={30}
              max={90}
              value={simAge}
              onChange={(e) => onAgeChange(Number(e.target.value))}
              className="scenario-age-slider w-full"
              aria-valuemin={30}
              aria-valuemax={90}
              aria-valuenow={simAge}
              aria-label={`發生年齡 ${simAge} 歲`}
            />
          </div>
        </div>
      </div>
      <div>
        <FormLabel className="px-0.5">情境</FormLabel>
        <ScenarioOptionList selected={simEvent} onSelect={onEventChange} />
      </div>
      <Button fullWidth className="btn-accent mt-1" onPress={onRun} isPending={isSimulating}>
        <FlaskConical className="w-4 h-4 mr-1.5" />
        {isSimulating ? '計算中...' : '開始模擬'}
      </Button>
    </StackForm>
  )
}

export function ScenarioResultModal({
  isOpen,
  onOpenChange,
  simResult,
  isSimulating,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  simResult: ScenarioResult | null
  isSimulating: boolean
}) {
  return (
    <RecommendationResultModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={simResult ? `${simResult.breakdown.category} · AI 推薦` : '情境模擬 · AI 推薦'}
      subtitle="依成員情境試算目標保障"
      result={simResult}
      isLoading={isSimulating}
      loadingLabel="AI 模擬計算中..."
    />
  )
}