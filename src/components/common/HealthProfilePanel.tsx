import { Button, Modal } from '@heroui/react'
import { Check, ChevronRight, ClipboardList, Sparkles } from 'lucide-react'
import { useState } from 'react'
import {
  HEALTH_PROFILE_QUESTIONS,
  PROTECTION_TIER_OPTIONS,
  buildProfileFromAnswers,
  type TierOption,
} from '../../data/healthProfile'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type { ProtectionLifeProfile } from '../../types'
import { CardSectionTitle, PageStack, StackBlock, StackList, TextModalLink } from './CardLayout'

const TARGET_LABELS: { key: keyof ProtectionLifeProfile['targets']; label: string; unit: string }[] =
  [
    { key: 'deathCoverage', label: '身故保障', unit: '萬元' },
    { key: 'medicalCoverage', label: '醫療保障', unit: '萬元' },
    { key: 'criticalCoverage', label: '重大疾病', unit: '萬元' },
    { key: 'longtermMonthly', label: '長照月給付', unit: '萬元/月' },
    { key: 'disabilityMonthly', label: '失能收入替代', unit: '萬元/月' },
  ]

function TierOverviewCard({
  tier,
  isCurrent,
}: {
  tier: TierOption
  isCurrent: boolean
}) {
  return (
    <article
      className={`health-tier-card ${isCurrent ? 'health-tier-card--current' : ''}`}
      aria-current={isCurrent ? 'true' : undefined}
    >
      <div className="health-tier-card__header">
        <div className="min-w-0 flex-1">
          <p className="health-tier-card__level">第 {tier.tier} 級</p>
          <p className="health-tier-card__title">{tier.label}</p>
          <p className="health-tier-card__subtitle">{tier.subtitle}</p>
        </div>
        {isCurrent && (
          <span className="health-tier-card__badge">
            <Check className="w-3 h-3" />
            目前
          </span>
        )}
      </div>
      <p className="health-tier-card__desc">{tier.description}</p>
      <div className="health-tier-card__targets">
        {TARGET_LABELS.map(({ key, label, unit }) => (
          <div key={key} className="health-tier-card__target">
            <p className="health-tier-card__target-label">{label}</p>
            <p className="health-tier-card__target-value">
              {tier.targets[key]} {unit}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}

interface HealthProfileHeroSummaryProps {
  profile: ProtectionLifeProfile
  onOpenCurrent: () => void
  onOpenCompare: () => void
}

/** 歡迎語列 — 家庭保險健康分級入口 */
export function HealthProfileHeroSummary({
  profile,
  onOpenCurrent,
  onOpenCompare,
}: HealthProfileHeroSummaryProps) {
  return (
    <div className="health-hero-summary">
      <div className="health-hero-summary__meta">
        <button
          type="button"
          onClick={onOpenCurrent}
          className="inline-flex items-center gap-1 m3-chip health-hero-summary__tier"
          aria-label={`查看第 ${profile.tier} 級 ${profile.tierLabel} 分級詳情`}
        >
          <ClipboardList className="w-3 h-3" aria-hidden />
          第 {profile.tier} 級 · {profile.tierLabel}
          <ChevronRight className="w-3 h-3" aria-hidden />
        </button>
        <TextModalLink
          onClick={onOpenCompare}
          aria-label="查看其他家庭保險健康分級"
        >
          查看其他分級
        </TextModalLink>
      </div>
    </div>
  )
}

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
      <div className="m3-icon-wrap m3-icon-wrap--md shrink-0">
        <ClipboardList className="w-5 h-5 text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="m3-card-eyebrow">家庭保險健康分級</p>
        <p className="text-sm font-semibold text-gray-800">
          第 {profile.tier} 級 · {profile.tierLabel}
        </p>
        <p className="text-[10px] text-gray-400 truncate">{profile.tierDescription}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-teal-400 shrink-0" />
    </button>
  )
}

export type HealthProfileViewScope = 'current' | 'compare'

interface HealthProfileModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  profile: ProtectionLifeProfile
  onSave: (profile: ProtectionLifeProfile) => void
  mode?: 'view' | 'onboarding'
  /** current：僅目前分級；compare：五級完整比較 */
  viewScope?: HealthProfileViewScope
}

function CurrentTierDetail({ profile }: { profile: ProtectionLifeProfile }) {
  const currentTier = PROTECTION_TIER_OPTIONS.find((tier) => tier.tier === profile.tier)

  return (
    <PageStack>
      <div className="m3-card-filled p-4">
        <p className="text-xs text-teal-600 font-medium mb-1">目前分級</p>
        <p className="text-xl font-bold text-teal-700">
          第 {profile.tier} 級 · {profile.tierLabel}
        </p>
        {currentTier && (
          <p className="text-xs text-gray-500 mt-1">{currentTier.subtitle}</p>
        )}
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{profile.tierDescription}</p>
        <p className="text-[10px] text-gray-400 mt-2">上次填寫：{profile.completedAt}</p>
      </div>

      <div>
        <CardSectionTitle>滿分保障目標（依此分級計算健康度）</CardSectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {TARGET_LABELS.map(({ key, label, unit }) => (
            <div key={key} className="m3-card p-3">
              <p className="text-[10px] text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-teal-700">
                {profile.targets[key]} {unit}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        此分級定義您家庭「期望的保障生活」，作為總覽保障健康度的滿分基準。若要與其他分級比較，請點選「查看家庭保險健康分級」。
      </p>
    </PageStack>
  )
}

export function HealthProfileModal({
  isOpen,
  onOpenChange,
  profile,
  onSave,
  mode = 'view',
  viewScope = 'current',
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
        <Modal.Dialog className="health-tier-modal max-w-lg">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              {editing
                ? '填寫期望的保障生活'
                : viewScope === 'compare'
                  ? '家庭保險健康分級總覽'
                  : '目前保障分級'}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {!editing && viewScope === 'current' ? (
              <CurrentTierDetail profile={profile} />
            ) : !editing ? (
              <StackBlock className="health-tier-overview">
                <div className="health-tier-overview__intro m3-card-filled p-4">
                  <p className="text-sm font-semibold text-gray-800">什麼是家庭保險健康分級？</p>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    如同投資風險屬性問卷，五級分類定義家庭「期望的保障生活」，作為保障健康度的滿分基準。總覽中的健康度分數，即依您選擇的分級目標計算達成率。
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    上次填寫：{profile.completedAt}
                  </p>
                </div>

                <div>
                  <CardSectionTitle
                    count={`第 ${profile.tier} 級 · ${profile.tierLabel}`}
                  >
                    五級分類總覽
                  </CardSectionTitle>
                  <StackList loose className="health-tier-overview__list">
                    {PROTECTION_TIER_OPTIONS.map((tier) => (
                      <TierOverviewCard
                        key={tier.tier}
                        tier={tier}
                        isCurrent={tier.tier === profile.tier}
                      />
                    ))}
                  </StackList>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  調整分級後，身故、醫療、重大疾病、長照與失能五類保障目標會同步更新，保障健康度分數亦會重新計算。
                </p>
              </StackBlock>
            ) : (
              <PageStack>
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
                  <StackList>
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
                  </StackList>
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
              </PageStack>
            )}
          </Modal.Body>
          <Modal.Footer className="flex gap-2">
            {!editing ? (
              <Button fullWidth className="btn-accent" onPress={() => setEditing(true)}>
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
                  <Button
                    fullWidth
                    className="btn-accent"
                    isDisabled={!canNext}
                    onPress={() => setStep((s) => s + 1)}
                  >
                    下一步
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    className="btn-accent"
                    isDisabled={!canNext}
                    onPress={handleSave}
                  >
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