import { Button, Modal } from '@heroui/react'
import { ChevronRight, ClipboardList, Sparkles } from 'lucide-react'
import { useState } from 'react'
import {
  HEALTH_PROFILE_QUESTIONS,
  PROTECTION_TIER_OPTIONS,
  buildProfileFromAnswers,
} from '../../data/healthProfile'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type { ProtectionLifeProfile } from '../../types'

interface HealthProfileEntryProps {
  profile: ProtectionLifeProfile
  onOpen: () => void
  compact?: boolean
}

/** 家庭保險健康分級 — 入口標籤 */
export function HealthProfileEntry({ profile, onOpen, compact }: HealthProfileEntryProps) {
  if (compact) {
    return (
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1 m3-chip bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
      >
        <ClipboardList className="w-3 h-3" />
        {profile.tierLabel}
        <ChevronRight className="w-3 h-3" />
      </button>
    )
  }

  return (
    <button
      onClick={onOpen}
      className="m3-card p-3 w-full flex items-center gap-3 text-left hover:shadow-md transition-shadow border-teal-100"
    >
      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
        <ClipboardList className="w-5 h-5 text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide">
          家庭保險健康分級
        </p>
        <p className="text-sm font-semibold text-gray-800">
          第 {profile.tier} 級 · {profile.tierLabel}
        </p>
        <p className="text-[10px] text-gray-400 truncate">{profile.tierDescription}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-teal-400 shrink-0" />
    </button>
  )
}

interface HealthProfileModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  profile: ProtectionLifeProfile
  onSave: (profile: ProtectionLifeProfile) => void
  mode?: 'view' | 'onboarding'
}

export function HealthProfileModal({
  isOpen,
  onOpenChange,
  profile,
  onSave,
  mode = 'view',
}: HealthProfileModalProps) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const [step, setStep] = useState(0)
  const [editing, setEditing] = useState(mode === 'onboarding')
  const [answers, setAnswers] = useState<Record<string, string>>(profile.answers)

  const questions = HEALTH_PROFILE_QUESTIONS
  const currentQ = questions[step]
  const selectedTier = PROTECTION_TIER_OPTIONS.find(
    (t) => t.tier === Number(answers.lifestyle || profile.tier),
  )

  const handleClose = (open: boolean) => {
    if (!open) {
      setStep(0)
      setEditing(false)
      setAnswers(profile.answers)
    }
    onOpenChange(open)
  }

  const handleSave = () => {
    onSave(buildProfileFromAnswers(answers))
    setEditing(false)
    setStep(0)
    if (mode === 'onboarding') onOpenChange(false)
  }

  const canNext = Boolean(answers[currentQ?.id])

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleClose}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside">
        <Modal.Dialog className="max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              {editing ? '填寫期望的保障生活' : '家庭保險健康分級'}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {!editing ? (
              <div className="space-y-4">
                <div className="m3-card-filled p-4">
                  <p className="text-xs text-teal-600 font-medium mb-1">目前分級</p>
                  <p className="text-xl font-bold text-teal-700">
                    第 {profile.tier} 級 · {profile.tierLabel}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{profile.tierDescription}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    上次填寫：{profile.completedAt}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    滿分保障目標（依此分級計算健康度）
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['身故保障', `${profile.targets.deathCoverage} 萬元`],
                      ['醫療保障', `${profile.targets.medicalCoverage} 萬元`],
                      ['重大疾病保障', `${profile.targets.criticalCoverage} 萬元`],
                      ['長照月給付', `${profile.targets.longtermMonthly} 萬元/月`],
                      ['失能收入替代', `${profile.targets.disabilityMonthly} 萬元/月`],
                    ].map(([label, value]) => (
                      <div key={label} className="m3-card p-3">
                        <p className="text-[10px] text-gray-400">{label}</p>
                        <p className="text-sm font-semibold text-teal-700">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  如同投資風險屬性問卷，此分級定義您家庭「期望的保障生活」，作為保障健康度的滿分基準。調整分級後，健康度分數會重新計算。
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i <= step ? 'bg-teal-500' : 'bg-sand-200'
                      }`}
                    />
                  ))}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    {currentQ.question}
                  </p>
                  <div className="space-y-2">
                    {currentQ.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [currentQ.id]: opt.value }))
                        }
                        className={`m3-card p-3 w-full text-left text-sm transition-all ${
                          answers[currentQ.id] === opt.value
                            ? 'ring-2 ring-teal-500 bg-teal-50'
                            : 'hover:bg-warm-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {step === questions.length - 1 && selectedTier && (
                  <div className="m3-card-warm p-3">
                    <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      預覽分級：{selectedTier.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{selectedTier.description}</p>
                  </div>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="flex gap-2">
            {!editing ? (
              <Button fullWidth onPress={() => setEditing(true)}>
                重新填寫問卷
              </Button>
            ) : (
              <>
                {step > 0 && (
                  <Button variant="secondary" onPress={() => setStep((s) => s - 1)}>
                    上一步
                  </Button>
                )}
                {step < questions.length - 1 ? (
                  <Button fullWidth isDisabled={!canNext} onPress={() => setStep((s) => s + 1)}>
                    下一步
                  </Button>
                ) : (
                  <Button fullWidth isDisabled={!canNext} onPress={handleSave}>
                    {mode === 'onboarding' ? '完成並建立家庭' : '儲存分級'}
                  </Button>
                )}
              </>
            )}
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}