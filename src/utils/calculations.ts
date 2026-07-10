import { defaultProtectionProfile } from '../data/healthProfile'
import type {
  AccidentPayoutGroup,
  AccidentPayoutItem,
  AdvisorRecommendation,
  CoverageGap,
  CoverageSummary,
  FamilyMember,
  GapBreakdownDisplay,
  FamilyCoverageDomain,
  FamilyCoverageDomainSummary,
  FamilyCoveragePolicyItem,
  FamilyCoverageSubcategory,
  NonAccidentCoverageGroup,
  NonAccidentCoverageItem,
  Policy,
  PolicyCategoryGroup,
  PolicyWithMember,
  ProductRecommendation,
  ProtectionLifeProfile,
  ScenarioEventType,
  ScenarioInput,
  ScenarioResult,
} from '../types'

/** 仍計入「現有保障」的保單狀態 */
const COVERING_POLICY_STATUSES: Policy['status'][] = ['active', 'expiring']

export function isPolicyProvidingCoverage(policy: Policy): boolean {
  return COVERING_POLICY_STATUSES.includes(policy.status)
}

export function findPolicyById(members: FamilyMember[], policyId: string): Policy | undefined {
  for (const member of members) {
    const policy = member.policies.find((entry) => entry.id === policyId)
    if (policy) return policy
  }
  return undefined
}

const ACCIDENT_EVENT_LABELS: Record<string, string> = {
  health: '就醫實支實付',
  accident: '意外身故／失能',
  life: '身故理賠',
}

const GAP_DEFS: {
  gapKey: CoverageGap['gapKey']
  category: string
  unit: string
  policyTypes: Array<FamilyMember['policies'][number]['type']>
  useMonthly: boolean
}[] = [
  { gapKey: 'death', category: '身故保障', unit: '萬元', policyTypes: ['life'], useMonthly: false },
  { gapKey: 'medical', category: '醫療保障', unit: '萬元', policyTypes: ['health'], useMonthly: false },
  {
    gapKey: 'critical',
    category: '重大疾病保障',
    unit: '萬元',
    policyTypes: ['critical'],
    useMonthly: false,
  },
  { gapKey: 'longterm', category: '長照月給付', unit: '萬元/月', policyTypes: ['longterm'], useMonthly: true },
  {
    gapKey: 'disability',
    category: '失能收入替代',
    unit: '萬元/月',
    policyTypes: ['disability', 'accident'],
    useMonthly: true,
  },
]

const GAP_DEF_BY_KEY = new Map(GAP_DEFS.map((def) => [def.gapKey, def]))

export function findMemberGapPolicy(
  member: FamilyMember,
  gapKey: CoverageGap['gapKey'],
  policyId?: string,
): Policy | undefined {
  const def = GAP_DEF_BY_KEY.get(gapKey)
  if (!def) return undefined

  const matches = member.policies.filter((policy) => {
    if (!def.policyTypes.includes(policy.type)) return false
    return def.useMonthly ? policy.monthlyPayout > 0 : policy.coverage > 0
  })

  if (policyId) {
    return matches.find((policy) => policy.id === policyId)
  }

  return (
    matches.find((policy) => isPolicyProvidingCoverage(policy)) ??
    matches.find((policy) => policy.status === 'expired')
  )
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatWan(amount: number): string {
  return `${(amount / 10000).toFixed(0)} 萬`
}

/** 保障缺口數值顯示（清楚標示單位，避免 2/5 萬元/月 混淆） */
export function formatGapAmount(value: number, unit: string): string {
  const display = Number.isInteger(value) ? String(value) : value.toFixed(1)
  const isMonthly = unit.includes('月')
  return isMonthly ? `${display} 萬元／月` : `${display} 萬元`
}

export function calculateGapPercent(current: number, recommended: number): number {
  if (recommended === 0) return 100
  return Math.min(100, Math.round((current / recommended) * 100))
}

function getTargetValue(
  gapKey: CoverageGap['gapKey'],
  profile: ProtectionLifeProfile,
): number {
  const map = {
    death: profile.targets.deathCoverage,
    medical: profile.targets.medicalCoverage,
    critical: profile.targets.criticalCoverage,
    longterm: profile.targets.longtermMonthly,
    disability: profile.targets.disabilityMonthly,
  }
  return map[gapKey]
}

/** 依總覽保障缺口分類，彙整全家保單（每張保單僅歸入一類） */
export function groupPoliciesByGapCategory(members: FamilyMember[]): PolicyCategoryGroup[] {
  const buckets = new Map<CoverageGap['gapKey'] | 'other', PolicyWithMember[]>()
  for (const { gapKey } of GAP_DEFS) {
    buckets.set(gapKey, [])
  }
  buckets.set('other', [])

  for (const member of members) {
    for (const policy of member.policies) {
      const item: PolicyWithMember = {
        policy,
        memberId: member.id,
        memberName: member.name,
        avatarSeed: member.avatarSeed,
      }
      const def = GAP_DEFS.find((d) => d.policyTypes.includes(policy.type))
      if (def) {
        buckets.get(def.gapKey)!.push(item)
      } else {
        buckets.get('other')!.push(item)
      }
    }
  }

  const groups: PolicyCategoryGroup[] = GAP_DEFS.map(({ gapKey, category }) => ({
    gapKey,
    category,
    policies: buckets.get(gapKey) ?? [],
  }))

  const other = buckets.get('other') ?? []
  if (other.length > 0) {
    groups.push({ gapKey: 'other', category: '其他保障', policies: other })
  }

  return groups
}

export function countMemberPolicies(members: FamilyMember[]): number {
  return members.reduce((total, member) => total + member.policies.length, 0)
}

function computeGapFromMembers(
  members: FamilyMember[],
  profile: ProtectionLifeProfile,
): CoverageGap[] {
  return GAP_DEFS.map(({ gapKey, category, unit, policyTypes, useMonthly }) => {
    let current = 0
    const coveredMembers = new Set<string>()
    const lapsedMembers: CoverageGap['lapsedMembers'] = []

    for (const member of members) {
      let memberContribution = 0
      let lapsedPolicyId: string | undefined

      for (const policy of member.policies) {
        if (!policyTypes.includes(policy.type)) continue

        const hasAmount = useMonthly
          ? policy.monthlyPayout > 0
          : policy.coverage > 0
        if (!hasAmount) continue

        if (isPolicyProvidingCoverage(policy)) {
          memberContribution += useMonthly
            ? policy.monthlyPayout / 10000
            : policy.coverage / 10000
        } else if (policy.status === 'expired') {
          lapsedPolicyId = policy.id
        }
      }

      if (memberContribution > 0) {
        current += memberContribution
        coveredMembers.add(member.name)
      } else if (lapsedPolicyId) {
        lapsedMembers.push({
          memberId: member.id,
          memberName: member.name,
          policyId: lapsedPolicyId,
        })
      }
    }

    return {
      category,
      gapKey,
      current: Math.round(current * 10) / 10,
      recommended: getTargetValue(gapKey, profile),
      unit,
      coveredMembers: [...coveredMembers],
      lapsedMembers,
    }
  })
}

const LIFE_DOMAIN_DEFS: {
  subcategoryType: string
  subcategoryLabel: string
  policyTypes: Policy['type'][]
  useMonthly: boolean
}[] = [
  { subcategoryType: 'death', subcategoryLabel: '身故保障', policyTypes: ['life'], useMonthly: false },
  {
    subcategoryType: 'disability',
    subcategoryLabel: '失能月給付',
    policyTypes: ['disability'],
    useMonthly: true,
  },
  {
    subcategoryType: 'longterm',
    subcategoryLabel: '長照月給付',
    policyTypes: ['longterm'],
    useMonthly: true,
  },
  {
    subcategoryType: 'annuity',
    subcategoryLabel: '年金月給付',
    policyTypes: ['savings'],
    useMonthly: true,
  },
]

const MEDICAL_DOMAIN_DEFS: {
  subcategoryType: string
  subcategoryLabel: string
  policyTypes: Policy['type'][]
  useMonthly: boolean
}[] = [
  {
    subcategoryType: 'hospital',
    subcategoryLabel: '住院／實支實付',
    policyTypes: ['health'],
    useMonthly: false,
  },
  {
    subcategoryType: 'critical',
    subcategoryLabel: '重大疾病',
    policyTypes: ['critical'],
    useMonthly: false,
  },
]

function getPolicyDisplayAmount(policy: Policy, useMonthly: boolean): number {
  return useMonthly ? policy.monthlyPayout : policy.coverage
}

function buildFamilyCoverageDomain(
  members: FamilyMember[],
  domain: FamilyCoverageDomain,
  label: string,
  description: string,
  defs: typeof LIFE_DOMAIN_DEFS,
  headlineFromSubcategory: string | 'total',
): FamilyCoverageDomainSummary {
  const buckets = new Map<string, FamilyCoveragePolicyItem[]>()

  for (const member of members) {
    for (const policy of member.policies) {
      const def = defs.find((entry) => entry.policyTypes.includes(policy.type))
      if (!def) continue

      const amount = getPolicyDisplayAmount(policy, def.useMonthly)
      const listZeroCoverage =
        amount <= 0 && ['active', 'expiring', 'pending'].includes(policy.status)
      if (amount <= 0 && !listZeroCoverage) continue

      const item: FamilyCoveragePolicyItem = {
        id: policy.id,
        memberId: member.id,
        memberName: member.name,
        insurer: policy.insurer,
        policyName: policy.name,
        subcategoryType: def.subcategoryType,
        subcategoryLabel: def.subcategoryLabel,
        amount,
        isMonthly: def.useMonthly,
      }

      const list = buckets.get(def.subcategoryType) ?? []
      list.push(item)
      buckets.set(def.subcategoryType, list)
    }
  }

  const subcategories: FamilyCoverageSubcategory[] = defs
    .filter((def) => buckets.has(def.subcategoryType))
    .map((def) => {
      const items = [...(buckets.get(def.subcategoryType) ?? [])].sort(
        (a, b) => b.amount - a.amount,
      )
      return {
        subcategoryType: def.subcategoryType,
        subcategoryLabel: def.subcategoryLabel,
        isMonthly: def.useMonthly,
        totalAmount: items.reduce((sum, item) => {
          const policy = findPolicyById(members, item.id)
          return sum + (policy && isPolicyProvidingCoverage(policy) ? item.amount : 0)
        }, 0),
        memberNames: [...new Set(items.map((item) => item.memberName))],
        items,
      }
    })

  const allItems = subcategories.flatMap((group) => group.items)
  const memberNames = [...new Set(allItems.map((item) => item.memberName))]
  const headlineGroup =
    headlineFromSubcategory === 'total'
      ? null
      : subcategories.find((group) => group.subcategoryType === headlineFromSubcategory)
  const headlineAmount =
    headlineFromSubcategory === 'total'
      ? subcategories
          .filter((group) => !group.isMonthly)
          .reduce((sum, group) => sum + group.totalAmount, 0)
      : (headlineGroup?.totalAmount ?? 0)

  return {
    domain,
    label,
    description,
    headlineAmount,
    headlineUnit:
      headlineFromSubcategory === 'total' || !headlineGroup?.isMonthly ? '元' : '元/月',
    policyCount: allItems.length,
    memberCount: memberNames.length,
    memberNames,
    activeClaimCount: 0,
    subcategories,
  }
}

export function computeFamilyCoverageDomains(
  members: FamilyMember[],
): Record<FamilyCoverageDomain, FamilyCoverageDomainSummary> {
  return {
    life: buildFamilyCoverageDomain(
      members,
      'life',
      '壽險保障',
      '身故、失能、長照與年金等人壽保險約定給付。',
      LIFE_DOMAIN_DEFS,
      'death',
    ),
    medical: buildFamilyCoverageDomain(
      members,
      'medical',
      '醫療保障',
      '住院醫療、實支實付與重大疾病等健康保險保障。',
      MEDICAL_DOMAIN_DEFS,
      'total',
    ),
  }
}

/** 依主管機關人身保險險種分類（壽險公會通報），非意外保障不含傷害保險 */
const NON_ACCIDENT_GROUP_DEFS: {
  categoryType: string
  categoryLabel: string
  policyTypes: Policy['type'][]
  useMonthly: boolean
}[] = [
  { categoryType: 'life', categoryLabel: '人壽保險', policyTypes: ['life'], useMonthly: false },
  { categoryType: 'health', categoryLabel: '健康保險（醫療）', policyTypes: ['health'], useMonthly: false },
  {
    categoryType: 'critical',
    categoryLabel: '健康保險（重大疾病）',
    policyTypes: ['critical'],
    useMonthly: false,
  },
  {
    categoryType: 'longterm',
    categoryLabel: '健康保險（長期照護）',
    policyTypes: ['longterm'],
    useMonthly: true,
  },
  {
    categoryType: 'disability',
    categoryLabel: '健康保險（失能給付）',
    policyTypes: ['disability'],
    useMonthly: true,
  },
  { categoryType: 'savings', categoryLabel: '年金保險', policyTypes: ['savings'], useMonthly: false },
]

const NON_ACCIDENT_GROUP_ORDER = NON_ACCIDENT_GROUP_DEFS.map((def) => def.categoryType)

function getNonAccidentPolicyAmount(policy: Policy, useMonthly: boolean): number {
  return useMonthly ? policy.monthlyPayout : policy.coverage
}

export function groupNonAccidentCoverage(members: FamilyMember[]): NonAccidentCoverageGroup[] {
  const buckets = new Map<string, NonAccidentCoverageItem[]>()

  for (const member of members) {
    for (const policy of member.policies) {
      if (policy.type === 'accident') continue

      const def = NON_ACCIDENT_GROUP_DEFS.find((entry) => entry.policyTypes.includes(policy.type))
      if (!def) continue

      const amount = getNonAccidentPolicyAmount(policy, def.useMonthly)
      if (amount <= 0) continue

      const item: NonAccidentCoverageItem = {
        id: policy.id,
        memberName: member.name,
        insurer: policy.insurer,
        policyName: policy.name,
        categoryType: def.categoryType,
        categoryLabel: def.categoryLabel,
        amount,
        isMonthly: def.useMonthly,
      }

      const list = buckets.get(def.categoryType) ?? []
      list.push(item)
      buckets.set(def.categoryType, list)
    }
  }

  const buildGroup = (
    categoryType: string,
    categoryLabel: string,
    isMonthly: boolean,
    groupItems: NonAccidentCoverageItem[],
  ): NonAccidentCoverageGroup => ({
    categoryType,
    categoryLabel,
    isMonthly,
    totalAmount: groupItems.reduce((sum, item) => {
      const policy = findPolicyById(members, item.id)
      return sum + (policy && isPolicyProvidingCoverage(policy) ? item.amount : 0)
    }, 0),
    memberNames: [...new Set(groupItems.map((item) => item.memberName))],
    items: [...groupItems].sort((a, b) => b.amount - a.amount),
  })

  return NON_ACCIDENT_GROUP_ORDER.filter((type) => buckets.has(type)).map((type) => {
    const def = NON_ACCIDENT_GROUP_DEFS.find((entry) => entry.categoryType === type)!
    return buildGroup(type, def.categoryLabel, def.useMonthly, buckets.get(type)!)
  })
}

const PAYOUT_GROUP_ORDER = ['accident', 'health', 'life'] as const

export function groupAccidentPayouts(items: AccidentPayoutItem[]): AccidentPayoutGroup[] {
  const map = new Map<string, AccidentPayoutItem[]>()
  for (const item of items) {
    const list = map.get(item.eventType) ?? []
    list.push(item)
    map.set(item.eventType, list)
  }

  const buildGroup = (eventType: string, groupItems: AccidentPayoutItem[]): AccidentPayoutGroup => ({
    eventType,
    eventLabel: groupItems[0]?.eventLabel ?? '事件理賠',
    totalAmount: groupItems.reduce((sum, item) => sum + item.amount, 0),
    memberNames: [...new Set(groupItems.map((item) => item.memberName))],
    items: [...groupItems].sort((a, b) => b.amount - a.amount),
  })

  const ordered = PAYOUT_GROUP_ORDER.filter((type) => map.has(type)).map((type) =>
    buildGroup(type, map.get(type)!),
  )

  const extra = [...map.keys()]
    .filter((type) => !PAYOUT_GROUP_ORDER.includes(type as (typeof PAYOUT_GROUP_ORDER)[number]))
    .map((type) => buildGroup(type, map.get(type)!))

  return [...ordered, ...extra]
}

export function computeCoverageSummary(
  members: FamilyMember[],
  profile: ProtectionLifeProfile,
): CoverageSummary {
  let fixedCoverage = 0
  const accidentPayouts: AccidentPayoutItem[] = []

  for (const member of members) {
    for (const policy of member.policies) {
      if (policy.type !== 'accident') {
        fixedCoverage += policy.coverage
      }
      if (policy.eventPayout > 0) {
        accidentPayouts.push({
          id: policy.id,
          memberName: member.name,
          insurer: policy.insurer,
          policyName: policy.name,
          eventType: policy.type,
          eventLabel: ACCIDENT_EVENT_LABELS[policy.type] ?? '事件理賠',
          amount: policy.eventPayout,
        })
      }
    }
  }

  const gaps = computeGapFromMembers(members, profile)
  const avgGap =
    gaps.reduce((sum, g) => sum + calculateGapPercent(g.current, g.recommended), 0) /
    gaps.length
  const healthScore = Math.round(avgGap)

  return {
    healthScore,
    healthTierLabel: profile.tierLabel,
    fixedCoverage,
    accidentPayouts,
    gaps,
  }
}

const DEFAULT_ADVISOR: AdvisorRecommendation = {
  name: '林佳蓉',
  title: '南山人壽資深保障顧問',
  phone: '02-2345-6789',
  reason: '專精長照與退休規劃，服務王建國家族已 5 年',
}

interface GapRecommendationBase {
  narrative: string
  recommendations: ProductRecommendation[]
  recommendedAdvisor: AdvisorRecommendation
}

export interface GapRecommendationResult extends GapRecommendationBase {
  breakdown: GapBreakdownDisplay
}

const LUMP_SUM_YEARS = 10

type GapDef = (typeof GAP_DEFS)[number]

function getGapDef(gapKey: CoverageGap['gapKey']): GapDef {
  return GAP_DEFS.find((g) => g.gapKey === gapKey)!
}

function sumMemberCategory(
  member: FamilyMember,
  policyTypes: GapDef['policyTypes'],
  useMonthly: boolean,
): number {
  let total = 0
  for (const policy of member.policies) {
    if (!policyTypes.includes(policy.type)) continue
    if (!isPolicyProvidingCoverage(policy)) continue
    if (useMonthly) {
      if (policy.monthlyPayout > 0) total += policy.monthlyPayout
    } else if (policy.coverage > 0) {
      total += policy.coverage
    }
  }
  return total
}

function sumFamilyCategory(
  members: FamilyMember[],
  policyTypes: GapDef['policyTypes'],
  useMonthly: boolean,
): number {
  return members.reduce(
    (sum, member) => sum + sumMemberCategory(member, policyTypes, useMonthly),
    0,
  )
}

function wanFromTwd(amount: number): number {
  return Math.round((amount / 10000) * 10) / 10
}

function buildProfileNote(
  profile: ProtectionLifeProfile,
  category: string,
  targetLabel: string,
): string {
  return `與總覽相同基準：依「${profile.tierLabel}」分級，家庭${category}目標為 ${targetLabel}。`
}

export function buildCoverageGapBreakdown(
  gap: CoverageGap,
  profile: ProtectionLifeProfile,
): GapBreakdownDisplay {
  const isMonthly = gap.unit.includes('月')
  const gapValue = Math.max(0, Math.round((gap.recommended - gap.current) * 10) / 10)

  return {
    category: gap.category,
    isMonthly,
    formula: isMonthly
      ? '每月缺口 ＝ 家庭目標（萬元／月）− 現有保障（萬元／月）'
      : '保障缺口 ＝ 家庭目標（萬元）− 現有保障（萬元）',
    profileNote: buildProfileNote(
      profile,
      gap.category,
      formatGapAmount(gap.recommended, gap.unit),
    ),
    rows: [
      {
        label: '家庭目標',
        value: formatGapAmount(gap.recommended, gap.unit),
        tone: 'target',
      },
      {
        label: '現有保障',
        value: formatGapAmount(gap.current, gap.unit),
        tone: 'current',
      },
      {
        label: isMonthly ? '每月缺口' : '保障缺口',
        value: formatGapAmount(gapValue, gap.unit),
        tone: 'gap',
      },
    ],
  }
}

const SCENARIO_GAP_MAP: Record<
  ScenarioEventType,
  { gapKey: CoverageGap['gapKey']; policyTypes: GapDef['policyTypes']; useMonthly: boolean; needMultiplier: number }
> = {
  disability: {
    gapKey: 'disability',
    policyTypes: ['disability', 'accident'],
    useMonthly: true,
    needMultiplier: 1,
  },
  'longterm-care': {
    gapKey: 'longterm',
    policyTypes: ['longterm'],
    useMonthly: true,
    needMultiplier: 1.2,
  },
  death: {
    gapKey: 'death',
    policyTypes: ['life'],
    useMonthly: false,
    needMultiplier: 1,
  },
  accident: {
    gapKey: 'death',
    policyTypes: ['accident'],
    useMonthly: false,
    needMultiplier: 1,
  },
  retirement: {
    gapKey: 'disability',
    policyTypes: ['savings', 'disability', 'longterm'],
    useMonthly: true,
    needMultiplier: 1,
  },
}

function attachBoostLabels(
  recommendations: ProductRecommendation[],
  gapTwd: number,
  isMonthly: boolean,
): ProductRecommendation[] {
  const boosts: Record<string, { monthly?: number; coverage?: number }> = {
    '國泰人壽樂活失能扶助保險': { monthly: 15000 },
    '新光人壽長照尊榮定期保險': { monthly: 20000 },
    '富邦人壽樂齡終身壽險增額': { coverage: 1000000 },
    '國泰人壽新實支實付醫療險': { coverage: 500000 },
    '國泰人壽真好康重大疾病終身保險': { coverage: 1000000 },
    '南山人壽健康滿百防癌定期保險': { coverage: 800000 },
    '新光人壽新重大疾病險': { coverage: 1000000 },
    '南山人壽科技業主管意外保障': { coverage: 3000000 },
  }

  return recommendations.map((rec) => {
    const boost = boosts[rec.name]
    if (!boost) return rec
    if (isMonthly && boost.monthly) {
      const closes = gapTwd > 0 ? Math.min(100, Math.round((boost.monthly / gapTwd) * 100)) : 0
      return {
        ...rec,
        estimatedBoostLabel: `預估補足每月 ${formatCurrency(boost.monthly)}${closes > 0 ? `（約填補 ${closes}% 缺口）` : ''}`,
      }
    }
    if (!isMonthly && boost.coverage) {
      const closes = gapTwd > 0 ? Math.min(100, Math.round((boost.coverage / gapTwd) * 100)) : 0
      return {
        ...rec,
        estimatedBoostLabel: `預估增加 ${formatWan(boost.coverage)} 保額${closes > 0 ? `（約填補 ${closes}% 缺口）` : ''}`,
      }
    }
    return rec
  })
}

const GAP_RECOMMENDATIONS: Record<CoverageGap['gapKey'], GapRecommendationBase> = {
  critical: {
    narrative:
      '您的家庭目前尚無「重大疾病一次給付」保障。若家人罹患癌症、心肌梗塞等重大疾病，一次性理賠金可支應療養與收入中斷期間的開銷，建議優先為主要經濟支柱補強。',
    recommendations: [
      {
        name: '國泰人壽真好康重大疾病終身保險',
        type: 'critical',
        reason: '涵蓋常見重大疾病一次給付，保額可依家庭需求彈性規劃',
        estimatedPremium: 4200,
      },
      {
        name: '南山人壽健康滿百防癌定期保險',
        type: 'critical',
        reason: '針對癌症提供分階段給付，適合補強癌症保障缺口',
        estimatedPremium: 2800,
      },
      {
        name: '新光人壽新重大疾病險',
        type: 'critical',
        reason: '一次給付型保障，確保罹病後生活品質與治療費用',
        estimatedPremium: 3600,
      },
    ],
    recommendedAdvisor: {
      ...DEFAULT_ADVISOR,
      reason: '專精重大疾病與醫療保障規劃，曾協助類似家庭補強一次給付型保障',
    },
  },
  death: {
    narrative: '身故保障仍有缺口，建議提升壽險保額，確保家人生活無虞。',
    recommendations: [
      {
        name: '富邦人壽樂齡終身壽險增額',
        type: 'life',
        reason: '提升身故保障，確保家人生活無虞',
        estimatedPremium: 5200,
      },
    ],
    recommendedAdvisor: { ...DEFAULT_ADVISOR, reason: '擅長身故保障與受益人安排' },
  },
  medical: {
    narrative: '醫療實支實付保障仍有缺口，建議補強住院與手術理賠額度。',
    recommendations: [
      {
        name: '國泰人壽新實支實付醫療險',
        type: 'health',
        reason: '補足醫療住院與手術實支實付缺口',
        estimatedPremium: 2400,
      },
    ],
    recommendedAdvisor: { ...DEFAULT_ADVISOR, reason: '醫療險與實支實付規劃經驗豐富' },
  },
  longterm: {
    narrative: '長照月給付仍有缺口，建議評估商業長照險搭配政府長照 2.0 資源。',
    recommendations: [
      {
        name: '新光人壽長照尊榮定期保險',
        type: 'longterm',
        reason: '補足長照月給付缺口',
        estimatedPremium: 3500,
      },
    ],
    recommendedAdvisor: { ...DEFAULT_ADVISOR, reason: '熟悉長照 2.0 與商業長照險搭配' },
  },
  disability: {
    narrative: '失能收入替代仍有缺口，建議補強失能後每月固定給付。',
    recommendations: [
      {
        name: '國泰人壽樂活失能扶助保險',
        type: 'disability',
        reason: '提供失能後每月固定收入替代',
        estimatedPremium: 2800,
      },
    ],
    recommendedAdvisor: { ...DEFAULT_ADVISOR, reason: '專精失能與收入替代規劃' },
  },
}

export function getGapRecommendations(
  gap: CoverageGap,
  profile: ProtectionLifeProfile,
): GapRecommendationResult {
  const base = GAP_RECOMMENDATIONS[gap.gapKey]
  const breakdown = buildCoverageGapBreakdown(gap, profile)
  const gapTwd = Math.max(0, (gap.recommended - gap.current) * 10000)
  const isMonthly = gap.unit.includes('月')

  return {
    ...base,
    breakdown,
    recommendations: attachBoostLabels(base.recommendations, gapTwd, isMonthly),
  }
}

export function simulateScenario(
  input: ScenarioInput,
  members: FamilyMember[],
  profile: ProtectionLifeProfile,
): ScenarioResult {
  const member = members.find((m) => m.id === input.memberId) ?? members[0]
  const config = SCENARIO_GAP_MAP[input.event]
  const gapDef = getGapDef(config.gapKey)
  const familyTarget = getTargetValue(config.gapKey, profile)

  const memberCurrentTwd = sumMemberCategory(member, config.policyTypes, config.useMonthly)
  const familyCurrentWan = wanFromTwd(
    sumFamilyCategory(members, gapDef.policyTypes, gapDef.useMonthly),
  )

  let breakdown: GapBreakdownDisplay
  let gapAmount: number
  let narrative: string

  if (config.useMonthly) {
    const needTwd = Math.round(member.monthlyExpense * config.needMultiplier)
    gapAmount = Math.max(0, needTwd - memberCurrentTwd)
    const currentWan = wanFromTwd(memberCurrentTwd)

    const needLabel =
      input.event === 'longterm-care'
        ? '每月照護需求'
        : input.event === 'retirement'
          ? '退休後月支出'
          : '每月生活需求'

    breakdown = {
      category: gapDef.category,
      isMonthly: true,
      formula: '每月缺口 ＝ 每月需求 − 現有理賠（每月）',
      profileNote: `${buildProfileNote(profile, gapDef.category, formatGapAmount(familyTarget, gapDef.unit))} 此成員現有 ${formatGapAmount(currentWan, gapDef.unit)}，家庭合計 ${formatGapAmount(familyCurrentWan, gapDef.unit)}。`,
      rows: [
        {
          label: needLabel,
          value: formatCurrency(needTwd),
          tone: 'need',
        },
        {
          label: '現有理賠（每月）',
          value: formatCurrency(memberCurrentTwd),
          tone: 'current',
        },
        {
          label: '每月缺口',
          value: formatCurrency(gapAmount),
          tone: 'gap',
        },
        {
          label: '家庭目標（參考）',
          value: formatGapAmount(familyTarget, gapDef.unit),
          tone: 'target',
        },
      ],
    }

    const eventLabels: Partial<Record<ScenarioEventType, string>> = {
      disability: '失能',
      'longterm-care': '長期照護',
      retirement: '退休',
    }
    narrative = `若 ${member.name} 在 ${input.age} 歲發生${eventLabels[input.event] ?? '此情境'}，每月生活需求約 ${formatCurrency(needTwd)}，現有相關保單每月可給付 ${formatCurrency(memberCurrentTwd)}，每月缺口 ${formatCurrency(gapAmount)}。下方推薦保單專為補足此缺口設計。`
  } else {
    const needTwd = member.monthlyExpense * 12 * LUMP_SUM_YEARS
    gapAmount = Math.max(0, needTwd - memberCurrentTwd)
    const needWan = wanFromTwd(needTwd)
    const currentWan = wanFromTwd(memberCurrentTwd)
    const gapWan = wanFromTwd(gapAmount)

    const policyLabel = input.event === 'accident' ? '意外險' : '壽險'

    breakdown = {
      category: input.event === 'accident' ? '意外保障' : gapDef.category,
      isMonthly: false,
      formula: `保障缺口 ＝ 建議保額 − 現有${policyLabel}保額`,
      profileNote: `${buildProfileNote(profile, gapDef.category, formatGapAmount(familyTarget, gapDef.unit))} 建議保額依「月支出 × 12 個月 × ${LUMP_SUM_YEARS} 年」估算約 ${needWan} 萬元。`,
      rows: [
        {
          label: '建議保額',
          value: `${needWan} 萬元`,
          tone: 'need',
        },
        {
          label: `現有${policyLabel}保額`,
          value: `${currentWan} 萬元`,
          tone: 'current',
        },
        {
          label: '保障缺口',
          value: `${gapWan} 萬元`,
          tone: 'gap',
        },
        {
          label: '家庭目標（參考）',
          value: formatGapAmount(familyTarget, gapDef.unit),
          tone: 'target',
        },
      ],
    }

    narrative =
      input.event === 'accident'
        ? `若 ${member.name} 在 ${input.age} 歲發生意外，現有意外險保額 ${currentWan} 萬元，建議至少 ${needWan} 萬元（約 ${LUMP_SUM_YEARS} 年家庭支出），保障缺口 ${gapWan} 萬元。`
        : `若 ${member.name} 在 ${input.age} 歲不幸身故，現有壽險保額 ${currentWan} 萬元，建議至少 ${needWan} 萬元（約 ${LUMP_SUM_YEARS} 年家庭支出），保障缺口 ${gapWan} 萬元。`
  }

  const baseRecs = GAP_RECOMMENDATIONS[config.gapKey]
  const recPool =
    input.event === 'accident'
      ? [
          {
            name: '南山人壽安心守護意外險',
            type: 'accident',
            reason: '補足意外身故／失能一次性理賠缺口',
            estimatedPremium: 1200,
          },
          ...GAP_RECOMMENDATIONS.death.recommendations.slice(0, 1),
        ]
      : baseRecs.recommendations

  return {
    breakdown,
    gapAmount,
    affectedMembers: members.filter((m) => m.id !== member.id).map((m) => m.name),
    recommendations: attachBoostLabels(recPool, gapAmount, config.useMonthly),
    recommendedAdvisor: {
      ...DEFAULT_ADVISOR,
      reason: baseRecs.recommendedAdvisor.reason,
    },
    narrative,
  }
}

export function generateAIResponse(
  question: string,
  members: FamilyMember[],
  profile: ProtectionLifeProfile = defaultProtectionProfile,
): string {
  const q = question.toLowerCase()

  if (q.includes('失能') || q.includes('55')) {
    const member = members.find((m) => m.role === 'owner') ?? members[0]
    const result = simulateScenario(
      { age: 55, event: 'disability', memberId: member.id },
      members,
      profile,
    )
    const needRow = result.breakdown.rows.find((r) => r.tone === 'need')
    const currentRow = result.breakdown.rows.find((r) => r.tone === 'current')
    const gapRow = result.breakdown.rows.find((r) => r.tone === 'gap')
    return `根據您家庭的保單資料，若 ${member.name} 在 55 歲發生失能：\n\n${result.breakdown.formula}\n• ${needRow?.label}：${needRow?.value}\n• ${currentRow?.label}：${currentRow?.value}\n• ${gapRow?.label}：${gapRow?.value}\n\n建議優先補強「失能收入替代」類保單。\n\n推薦顧問：${result.recommendedAdvisor.name}（${result.recommendedAdvisor.title}）`
  }

  if (q.includes('長照')) {
    const longtermMembers = members
      .map((m) => {
        const monthly = m.policies
          .filter((p) => p.type === 'longterm' && isPolicyProvidingCoverage(p))
          .reduce((sum, p) => sum + p.monthlyPayout, 0)
        return monthly > 0 ? { name: m.name, monthly, status: 'active' as const } : null
      })
      .filter(Boolean) as { name: string; monthly: number; status: 'active' }[]

    const lapsedLongterm = members.flatMap((m) =>
      m.policies
        .filter((p) => p.type === 'longterm' && p.status === 'expired' && p.monthlyPayout > 0)
        .map((p) => ({ name: m.name, policyName: p.name, expiryDate: p.expiryDate })),
    )

    const totalMonthly = longtermMembers.reduce((sum, m) => sum + m.monthly, 0)
    const activeLines = longtermMembers
      .map((m) => `• ${m.name}：月給付 ${formatCurrency(m.monthly)}`)
      .join('\n')
    const lapsedLines = lapsedLongterm
      .map(
        (entry) =>
          `• ${entry.name}：${entry.policyName} 已於 ${entry.expiryDate.replace(/-/g, '/')} 到期`,
      )
      .join('\n')

    const lapsedNote =
      lapsedLongterm.length > 0
        ? `\n\n⚠️ 保障中斷：\n${lapsedLines}\n\n建議儘快為 ${lapsedLongterm.map((e) => e.name).join('、')} 評估重新投保。`
        : ''

    return `您家庭目前的長照保障：\n\n${activeLines || '• 尚無有效長照月給付保單'}${lapsedNote}\n\n家庭合計有效月給付約 ${formatCurrency(totalMonthly)}，距離「穩健守護」目標 8 萬元／月尚有缺口。\n\n建議為王建國夫婦評估長照險加碼。`
  }

  if (q.includes('受益人') || q.includes('雅婷')) {
    return `王雅婷受益人檢視：\n\n• 南山人壽安心守護意外險：受益人「配偶 陳志明」✅\n• 建議新增父母為第二順位受益人\n\n可在「保障」頁面發起受益人更新協作。`
  }

  if (q.includes('遺產') || q.includes('稅')) {
    return `台灣遺產稅試算（王建國家庭）：\n\n• 估計遺產淨額：約 3,500 萬元\n• 預估遺產稅：約 451 萬元\n\n💡 善用每年 244 萬贈與免稅額，保險金受益人指定不列入遺產。`
  }

  return `您好！我是護家神山 AI 保障顧問。\n\n我可以協助您：\n• 分析家庭保障缺口\n• 模擬人生事件對財務的影響\n• 推薦適合的保險商品與專屬顧問\n\n請告訴我您想了解的面向，或使用情境模擬選單。`
}