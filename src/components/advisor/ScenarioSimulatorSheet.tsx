import { Button, Modal, Spinner } from '@heroui/react'
import { FlaskConical } from 'lucide-react'
import { PolicyRecommendationPanel } from '../common/PolicyRecommendationPanel'
import { SCENARIO_LABELS } from '../../data/mockData'
import type { FamilyMember, ScenarioEventType, ScenarioResult } from '../../types'

export const SCENARIO_OPTIONS: ScenarioEventType[] = [
  'disability',
  'longterm-care',
  'death',
  'accident',
  'retirement',
]

export function ScenarioQuickCards({
  selected,
  onSelect,
  compact = false,
}: {
  selected?: ScenarioEventType
  onSelect: (event: ScenarioEventType) => void
  compact?: boolean
}) {
  return (
    <div className={`flex flex-wrap ${compact ? 'gap-2 px-1.5' : 'gap-2.5'}`}>
      {SCENARIO_OPTIONS.map((ev) => (
        <button
          key={ev}
          type="button"
          onClick={() => onSelect(ev)}
          className={`m3-chip py-1.5 text-xs font-medium transition-colors ${
            compact ? 'px-3.5' : 'px-3'
          } ${
            selected === ev
              ? 'bg-teal-500 text-white'
              : 'bg-white/80 text-gray-600 border border-sand-200 hover:border-teal-200 hover:bg-teal-50'
          }`}
        >
          {SCENARIO_LABELS[ev]}
        </button>
      ))}
    </div>
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
  return (
    <div className={`space-y-3 ${compact ? 'pt-0.5 px-1' : ''}`}>
      <div className={compact ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
        <div>
          <label className="text-[10px] font-medium text-gray-500 mb-1 block px-0.5">成員</label>
          <select
            value={simMemberId}
            onChange={(e) => onMemberChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-sand-200 rounded-xl text-sm bg-white"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}（{m.age} 歲）
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-medium text-gray-500 mb-1 block px-0.5">
            發生年齡 · {simAge} 歲
          </label>
          <input
            type="range"
            min={30}
            max={90}
            value={simAge}
            onChange={(e) => onAgeChange(Number(e.target.value))}
            className="w-full accent-teal-500 mt-2 px-1"
          />
        </div>
      </div>
      <div className={compact ? 'advisor-dock-scenarios' : ''}>
        <label className="text-[10px] font-medium text-gray-500 mb-1.5 block px-0.5">情境</label>
        <ScenarioQuickCards selected={simEvent} onSelect={onEventChange} compact />
      </div>
      <Button fullWidth className="btn-accent mt-1" onPress={onRun} isPending={isSimulating}>
        <FlaskConical className="w-4 h-4 mr-1.5" />
        {isSimulating ? '計算中...' : '開始模擬'}
      </Button>
    </div>
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
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container size="lg" placement="bottom">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>情境模擬結果</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {isSimulating ? (
              <div className="flex flex-col items-center py-10 gap-3">
                <Spinner size="lg" />
                <p className="text-sm text-teal-600">AI 模擬計算中...</p>
              </div>
            ) : simResult ? (
              <PolicyRecommendationPanel
                breakdown={simResult.breakdown}
                narrative={simResult.narrative}
                recommendations={simResult.recommendations}
                recommendedAdvisor={simResult.recommendedAdvisor}
              />
            ) : null}
          </Modal.Body>
          {simResult && !isSimulating && (
            <Modal.Footer>
              <Button slot="close" fullWidth onPress={() => onOpenChange(false)}>
                關閉
              </Button>
            </Modal.Footer>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}