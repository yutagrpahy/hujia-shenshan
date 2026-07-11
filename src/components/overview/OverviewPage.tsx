import {
  AlertCircle,
  ChevronRight,
  Eye,
  Heart,
  Sparkles,
  SquareArrowOutUpRight,
  Trophy,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { publicAsset } from '../../utils/publicAsset'
import { FamilyCoverageOverview } from './FamilyCoverageOverview'
import { GapRecommendationModal } from './GapRecommendationModal'
import { TodoCalendarPanel } from './TodoCalendarPanel'
import { useApp } from '../../context/AppContext'
import {
  HealthProfileHeroSummary,
  HealthProfileModal,
  type HealthProfileViewScope,
} from '../common/HealthProfilePanel'
import {
  CardItem,
  CardItemDetail,

  CardItemMetaLabel,
  CardItemTriAction,
  CardItemTriMain,
  CardItemTriRow,
  CardItemTitle,
  PageSection,
} from '../common/CardLayout'
import { MemberAvatar, MemberAvatarStack } from '../common/MemberAvatar'
import { SuccessBanner } from '../common/StateViews'
import type { CoverageGap } from '../../types'
import { formatGapAmount } from '../../utils/calculations'

export function OverviewPage() {
  const {
    coverage,
    todos,
    education,
    members,
    navigateToMember,
    uiState,
    protectionProfile,
    updateProtectionProfile,
  } = useApp()
  const [showHealthProfile, setShowHealthProfile] = useState(false)
  const [healthProfileScope, setHealthProfileScope] =
    useState<HealthProfileViewScope>('current')

  const openHealthProfile = (scope: HealthProfileViewScope) => {
    setHealthProfileScope(scope)
    setShowHealthProfile(true)
  }
  const [selectedGap, setSelectedGap] = useState<CoverageGap | null>(null)
  const sortedGaps = useMemo(
    () =>
      [...coverage.gaps].sort((a, b) => {
        if (a.current === 0 && b.current !== 0) return -1
        if (a.current !== 0 && b.current === 0) return 1
        return 0
      }),
    [coverage.gaps],
  )
  const scoreColor =
    coverage.healthScore >= 80
      ? 'text-teal-600'
      : coverage.healthScore >= 60
        ? 'text-teal-700'
        : 'text-teal-800'
  const healthStatusText =
    coverage.healthScore >= 80
      ? '保障充足'
      : coverage.healthScore >= 60
        ? '部分建議補強'
        : '有多項目標保障待補強'

  const navigateGapMember = (gap: CoverageGap, entry: CoverageGap['gapMembers'][number]) => {
    if (entry.hasCoverage && entry.policyId) {
      navigateToMember(entry.memberId, {
        policyId: entry.policyId,
        gapKey: gap.gapKey,
      })
      return
    }
    navigateToMember(entry.memberId)
  }

  return (
    <div className="overview-grid">
      <div className="hero-banner overview-grid--hero">
        <div className="hero-banner__mask" aria-hidden>
          <img
            src={publicAsset('/hero-mountain-nobg.png')}
            alt=""
            className="hero-banner__art"
          />
        </div>
        <div className="hero-banner__content">
          <p className="text-xs font-medium text-teal-600 mb-1">👋 早安，建國</p>
          <h3 className="text-lg font-bold text-gray-800">今天也要為家人守住幸福</h3>
          <MemberAvatarStack members={members} className="hero-banner__member-stack" />
          <HealthProfileHeroSummary
            profile={protectionProfile}
            onOpenCurrent={() => openHealthProfile('current')}
            onOpenCompare={() => openHealthProfile('compare')}
          />
        </div>
      </div>

      {uiState === 'success' && (
        <div className="overview-grid--full">
          <SuccessBanner />
        </div>
      )}

      <PageSection title="家庭保障總覽" fullWidth>
        <div className="m3-card m3-card--section">
          <div className="ds-section-inner">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f3f1ed" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="#2d7a70"
                    strokeWidth="3"
                    strokeDasharray={`${coverage.healthScore} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Heart className={`w-4 h-4 ${scoreColor}`} />
                  <span className={`text-lg md:text-xl font-bold ${scoreColor}`}>
                    {coverage.healthScore}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-semibold text-gray-800">保障健康度</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  依「{coverage.healthTierLabel}」分級計算 · {healthStatusText}
                </p>
              </div>
            </div>

            <FamilyCoverageOverview members={members} />
          </div>
        </div>
      </PageSection>

      <PageSection title="目標保障" fullWidth>
        <div className="gap-cards-list">
          {sortedGaps.map((gap) => {
            const pct =
              gap.recommended === 0
                ? 100
                : Math.min(100, Math.round((gap.current / gap.recommended) * 100))
            const achieved = gap.current >= gap.recommended
            const isUrgent = gap.current === 0
            const progressState = achieved ? 'achieved' : isUrgent ? 'urgent' : 'in-progress'
            const cardClass = `m3-card gap-card transition-all w-full text-left ${
              achieved ? 'gap-card--achieved' : isUrgent ? 'gap-card--urgent' : ''
            }`

            const cardContent = (
              <>
                <div className="flex justify-between items-start gap-2 mb-1.5 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="gap-card__title text-gray-700 truncate">{gap.category}</span>
                    {achieved ? (
                      <span className="m3-chip gap-achieved-badge shrink-0">
                        <Trophy className="w-3 h-3" />
                        目標達成
                      </span>
                    ) : isUrgent ? (
                      <span className="m3-chip gap-urgent-badge shrink-0">
                        <AlertCircle className="w-3 h-3" />
                        高風險
                      </span>
                    ) : null}
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-xs font-semibold ${
                        isUrgent ? 'text-coral-500' : 'text-teal-700'
                      }`}
                    >
                      目前 {formatGapAmount(gap.current, gap.unit)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      目標 {formatGapAmount(gap.recommended, gap.unit)}
                    </p>
                  </div>
                </div>
                <div
                  className={`gap-progress gap-progress--${progressState} mb-2`}
                  data-level={
                    progressState === 'in-progress'
                      ? pct < 60
                        ? 'low'
                        : pct < 85
                          ? 'mid'
                          : 'high'
                      : undefined
                  }
                >
                  <div
                    className={`gap-progress__fill gap-progress__fill--${progressState}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p
                  className={`text-[10px] mb-2 ${
                    achieved
                      ? 'text-teal-600 font-medium flex items-center gap-1'
                      : 'text-gray-400'
                  }`}
                >
                  {achieved ? (
                    <>
                      <Sparkles className="w-3 h-3" />
                      恭喜！此類保障已達成目標
                    </>
                  ) : isUrgent ? (
                    <>達成率 0% · 此類保障完全未達標</>
                  ) : (
                    <>達成率 {pct}%</>
                  )}
                </p>
                <div className="gap-member-chips flex items-center flex-wrap">
                  {gap.gapMembers.map((entry) => {
                    const member = members.find((m) => m.id === entry.memberId)
                    const tone = entry.hasCoverage ? 'covered' : 'uncovered'
                    const chipClass = entry.hasCoverage
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'

                    const chipContent = (
                      <>
                        {member ? (
                          <MemberAvatar
                            name={member.name}
                            seed={member.avatarSeed}
                            size="sm"
                            tone={tone}
                          />
                        ) : null}
                        {entry.memberName}
                      </>
                    )

                    return (
                      <button
                        key={entry.memberId}
                        type="button"
                        onClick={() => navigateGapMember(gap, entry)}
                        className={`gap-member-chip inline-flex items-center m3-chip transition-colors ${chipClass}`}
                        title={
                          entry.hasCoverage
                            ? '點擊前往成員保單詳情'
                            : '點擊前往成員詳情'
                        }
                      >
                        {chipContent}
                      </button>
                    )
                  })}
                </div>
                {isUrgent && (
                  <button
                    type="button"
                    className="gap-urgent-cta"
                    onClick={() => setSelectedGap(gap)}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      點擊查看 AI 推薦保單與專屬顧問
                    </span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
              </>
            )

            return (
              <div key={gap.category} className={cardClass}>
                {cardContent}
              </div>
            )
          })}
        </div>
      </PageSection>

      <TodoCalendarPanel
        todos={todos}
        onViewMember={(memberId) => navigateToMember(memberId)}
      />

      <PageSection title="推薦內容" fullWidth>
        <div className="education-grid">
          {education.map((item) => (
            <CardItem key={item.id} className="m3-card-item--lg">
              <CardItemTriRow className="education-card-row">
                <CardItemTriMain>
                  <CardItemMetaLabel className="text-[10px]">{item.stage}</CardItemMetaLabel>
                  <CardItemTitle>{item.title}</CardItemTitle>
                  <CardItemDetail className="education-duration">
                    <Eye className="education-duration__icon" aria-hidden />
                    <span>{item.duration}</span>
                  </CardItemDetail>
                </CardItemTriMain>
                <CardItemTriAction>
                  <span className="education-external-icon-wrap" title="將開啟外部網站">
                    <SquareArrowOutUpRight
                      className="education-external-icon w-4 h-4 text-gray-400"
                      aria-hidden
                    />
                    <span className="sr-only">將開啟外部網站</span>
                  </span>
                </CardItemTriAction>
              </CardItemTriRow>
            </CardItem>
          ))}
        </div>
      </PageSection>

      <HealthProfileModal
        isOpen={showHealthProfile}
        onOpenChange={setShowHealthProfile}
        profile={protectionProfile}
        onSave={updateProtectionProfile}
        viewScope={healthProfileScope}
      />

      <GapRecommendationModal
        gap={selectedGap}
        isOpen={!!selectedGap}
        onOpenChange={(open) => !open && setSelectedGap(null)}
      />

    </div>
  )
}