import { Button } from '@heroui/react'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Heart,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { FamilyCoverageOverview } from './FamilyCoverageOverview'
import { GapRecommendationModal } from './GapRecommendationModal'
import { TodoCalendarPanel } from './TodoCalendarPanel'
import { useApp } from '../../context/AppContext'
import { ROLE_LABELS } from '../../data/mockData'

import {
  HealthProfileEntry,
  HealthProfileModal,
  type HealthProfileViewScope,
} from '../common/HealthProfilePanel'
import { MemberAvatar } from '../common/MemberAvatar'
import { SuccessBanner } from '../common/StateViews'
import type { CoverageGap } from '../../types'
import { formatGapAmount } from '../../utils/calculations'

export function OverviewPage() {
  const {
    coverage,
    todos,
    education,
    members,
    currentUserId,
    navigateToMember,
    uiState,
    protectionProfile,
    updateProtectionProfile,
  } = useApp()
  const currentUser = members.find((m) => m.id === currentUserId)
  const roleLabel = ROLE_LABELS[currentUser?.role ?? 'owner'] ?? '家庭管理者'
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

  const findMemberByName = (name: string) =>
    members.find((m) => m.name === name)

  return (
    <div className="space-y-4 overview-grid w-full max-w-full min-w-0">
      <div className="hero-banner overview-grid--hero">
        <div className="hero-banner__mask" aria-hidden>
          <img
            src="/hero-mountain-nobg.png"
            alt=""
            className="hero-banner__art"
          />
        </div>
        <div className="hero-banner__content">
          <p className="text-xs font-medium text-teal-600 mb-1">👋 早安，建國</p>
          <h3 className="text-lg font-bold text-gray-800">今天也要為家人守住幸福</h3>
          <p className="text-xs text-gray-500 mt-1">
            {roleLabel} · 保障健康度 {coverage.healthScore} 分
          </p>
          <div className="mt-2">
            <HealthProfileEntry
              profile={protectionProfile}
              onOpen={() => openHealthProfile('current')}
              compact
            />
          </div>
        </div>
      </div>

      {uiState === 'success' && (
        <div className="overview-grid--full">
          <SuccessBanner />
        </div>
      )}

      <section className="w-full max-w-full min-w-0">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          家庭保障總覽
        </h3>

        <div className="m3-card p-4 md:p-6 w-full max-w-full min-w-0">
        <div className="flex items-center gap-4 mb-4">
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
              依「{coverage.healthTierLabel}」分級計算 ·{' '}
              {coverage.healthScore >= 80
                ? '保障充足'
                : coverage.healthScore >= 60
                  ? '部分建議補強'
                  : '有多項缺口需關注'}
            </p>
            <button
              onClick={() => openHealthProfile('compare')}
              className="text-[10px] text-teal-600 font-medium mt-1 hover:underline"
            >
              查看家庭保險健康分級 →
            </button>
          </div>
        </div>

        <HealthProfileEntry
          profile={protectionProfile}
          onOpen={() => openHealthProfile('current')}
        />

        <FamilyCoverageOverview members={members} />
        </div>
      </section>

      <section className="w-full max-w-full min-w-0">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          保障缺口
        </h3>
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
                        已達標
                      </span>
                    ) : isUrgent ? (
                      <span className="m3-chip gap-urgent-badge shrink-0">
                        <AlertCircle className="w-3 h-3" />
                        尚未投保
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Users className="w-3 h-3 text-teal-500 shrink-0" />
                  {gap.coveredMembers.length > 0 ? (
                    gap.coveredMembers.map((name) => {
                      const member = findMemberByName(name)
                      return member ? (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 m3-chip bg-teal-50 text-teal-700"
                        >
                          <MemberAvatar
                            name={member.name}
                            seed={member.avatarSeed}
                            size="xs"
                          />
                          {name}
                        </span>
                      ) : (
                        <span key={name} className="m3-chip bg-teal-50 text-teal-700">
                          {name}
                        </span>
                      )
                    })
                  ) : (
                    <span className="text-[10px] text-gray-400">尚無成員投保此類型</span>
                  )}
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
      </section>

      <TodoCalendarPanel
        todos={todos}
        onViewMember={(memberId) => navigateToMember(memberId)}
      />

      <section className="overview-grid--full">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          推薦內容
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 education-grid">
          {education.map((item) => (
            <div key={item.id} className="m3-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-teal-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-teal-600 font-medium">{item.stage}</p>
                <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                <p className="text-[10px] text-gray-400">{item.duration}</p>
              </div>
              <Button isIconOnly variant="ghost" size="sm" className="text-teal-600">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

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