import { getPolicySourceChipLabel } from '../data/policySourceLabels'
import type { CoverageSummary, FamilyMember, ProtectionLifeProfile } from '../types'
import { formatGapAmount, formatWan } from '../utils/calculations'

export interface AdvisorFamilyContext {
  healthScore: number
  healthTierLabel: string
  fixedCoverageWan: string
  gaps: Array<{
    category: string
    current: string
    target: string
    coveredMembers: string[]
    lapsedMembers: string[]
  }>
  members: Array<{
    name: string
    age: number
    role: string
    policyCount: number
    policies: Array<{
      name: string
      insurer: string
      type: string
      source: string
    }>
  }>
}

export function buildAdvisorContext(
  members: FamilyMember[],
  coverage: CoverageSummary,
  profile: ProtectionLifeProfile,
): AdvisorFamilyContext {
  return {
    healthScore: coverage.healthScore,
    healthTierLabel: profile.tierLabel,
    fixedCoverageWan: formatWan(coverage.fixedCoverage),
    gaps: coverage.gaps.map((gap) => ({
      category: gap.category,
      current: formatGapAmount(gap.current, gap.unit),
      target: formatGapAmount(gap.recommended, gap.unit),
      coveredMembers: gap.coveredMembers,
      lapsedMembers: gap.lapsedMembers.map((entry) => entry.memberName),
    })),
    members: members.map((member) => ({
      name: member.name,
      age: member.age,
      role: member.role,
      policyCount: member.policies.length,
      policies: member.policies.map((policy) => ({
        name: policy.name,
        insurer: policy.insurer,
        type: policy.type,
        source: getPolicySourceChipLabel(policy.source),
      })),
    })),
  }
}

export function buildAdvisorSystemPrompt(context: AdvisorFamilyContext): string {
  return `你是「護家神山」AI 保障顧問，專門協助台灣家庭規劃保險與保障缺口。
請一律以繁體中文回覆，語氣溫暖、專業、具體，避免空泛推銷話術。
回覆時請結合以下家庭資料，給出個人化建議；若資料不足請誠實說明並引導用戶補充。
可使用條列式，適度引用成員姓名與保障類別。勿捏造不存在的保單或金額。

家庭保障摘要（JSON）：
${JSON.stringify(context, null, 2)}`
}