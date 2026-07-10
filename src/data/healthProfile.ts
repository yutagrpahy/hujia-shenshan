import type { ProtectionLifeProfile, ProtectionTier } from '../types'

export interface TierOption {
  tier: ProtectionTier
  label: string
  subtitle: string
  description: string
  targets: ProtectionLifeProfile['targets']
}

/** 五級「期望保障生活」— 作為保障健康度滿分基準 */
export const PROTECTION_TIER_OPTIONS: TierOption[] = [
  {
    tier: 1,
    label: '基礎守護',
    subtitle: '單身或小家庭，先顧好基本風險',
    description: '足以應付一般醫療與基本身故保障，適合剛起步的保障規劃。',
    targets: {
      deathCoverage: 200,
      medicalCoverage: 50,
      longtermMonthly: 2,
      disabilityMonthly: 1,
      criticalCoverage: 30,
    },
  },
  {
    tier: 2,
    label: '安心生活',
    subtitle: '新婚或育兒家庭，生活穩定守護',
    description: '涵蓋常見醫療與收入中斷風險，讓家人日常生活不致受太大衝擊。',
    targets: {
      deathCoverage: 350,
      medicalCoverage: 100,
      longtermMonthly: 4,
      disabilityMonthly: 3,
      criticalCoverage: 50,
    },
  },
  {
    tier: 3,
    label: '穩健守護',
    subtitle: '事業高峰，平衡保障與預算',
    description: '兼顧身故、醫療、長照與失能替代，適合事業穩定、需照護父母的多代家庭。',
    targets: {
      deathCoverage: 500,
      medicalCoverage: 200,
      longtermMonthly: 8,
      disabilityMonthly: 5,
      criticalCoverage: 100,
    },
  },
  {
    tier: 4,
    label: '全面保障',
    subtitle: '高資產家庭，降低重大風險衝擊',
    description: '較高保額與月給付，可支撐長期照護與收入斷崖期的家庭開銷。',
    targets: {
      deathCoverage: 800,
      medicalCoverage: 300,
      longtermMonthly: 12,
      disabilityMonthly: 8,
      criticalCoverage: 150,
    },
  },
  {
    tier: 5,
    label: '頂級守護',
    subtitle: '全方位守護，留愛不留債',
    description: '最高等級保障生活期望，涵蓋高端醫療、長照與財富傳承規劃。',
    targets: {
      deathCoverage: 1200,
      medicalCoverage: 500,
      longtermMonthly: 20,
      disabilityMonthly: 12,
      criticalCoverage: 200,
    },
  },
]

export const HEALTH_PROFILE_QUESTIONS = [
  {
    id: 'lifeStage',
    question: '您目前最關注的人生階段是？',
    options: [
      { value: 'young', label: '剛組家庭／育兒中' },
      { value: 'mid', label: '事業高峰／父母照護' },
      { value: 'retire', label: '準備或已退休' },
    ],
  },
  {
    id: 'priority',
    question: '若只能優先補強一項，您會選？',
    options: [
      { value: 'death', label: '身故保障（留愛不留債）' },
      { value: 'medical', label: '醫療實支實付' },
      { value: 'longterm', label: '長照月給付' },
      { value: 'disability', label: '失能收入替代' },
    ],
  },
  {
    id: 'lifestyle',
    question: '您期望的「保障生活」是？',
    options: PROTECTION_TIER_OPTIONS.map((t) => ({
      value: String(t.tier),
      label: `${t.label} — ${t.subtitle}`,
    })),
  },
]

export function tierFromAnswers(answers: Record<string, string>): ProtectionTier {
  const lifestyle = Number(answers.lifestyle)
  if (lifestyle >= 1 && lifestyle <= 5) return lifestyle as ProtectionTier
  if (answers.lifeStage === 'retire') return 4
  if (answers.priority === 'longterm') return 3
  return 2
}

export function buildProfileFromAnswers(
  answers: Record<string, string>,
): ProtectionLifeProfile {
  const tier = tierFromAnswers(answers)
  const option = PROTECTION_TIER_OPTIONS.find((t) => t.tier === tier)!
  return {
    tier,
    tierLabel: option.label,
    tierDescription: option.description,
    targets: option.targets,
    completedAt: new Date().toISOString().split('T')[0],
    answers,
  }
}

export const defaultProtectionProfile: ProtectionLifeProfile = buildProfileFromAnswers({
  lifeStage: 'mid',
  priority: 'longterm',
  lifestyle: '3',
})