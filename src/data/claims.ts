import type { ClaimRecord, ClaimStatus, FamilyMember, Policy } from '../types'

const EVENT_LABELS: Record<Policy['type'], string> = {
  life: '身故理賠',
  health: '醫療理賠',
  accident: '意外理賠',
  longterm: '長照理賠',
  savings: '年金給付',
  disability: '失能理賠',
  critical: '重大疾病理賠',
}

interface ClaimTemplate {
  claimStatus: ClaimStatus
  progress: number
  statusLabel: string
  statusSummary: string
  isError: boolean
  updatedAt: string
}

/**
 * 僅收錄「已出險且保單仍有效」的理賠案件。
 * 保單到期、續保、核保待補件等行政事項由待辦／通知處理，不進入理賠頁。
 */
const CLAIM_BY_POLICY: Record<string, ClaimTemplate> = {
  // 待處理：王美玲住院醫療理賠待補件
  p11: {
    claimStatus: 'pending_docs',
    progress: 38,
    statusLabel: '待補件',
    statusSummary:
      '住院醫療理賠已受理，尚需補充診斷證明書與住院費用明細，請於 14 天內完成補件。',
    isError: true,
    updatedAt: '2026-07-09',
  },
  // 進行中：王美玲長照給付審核
  p3: {
    claimStatus: 'in_review',
    progress: 55,
    statusLabel: '理賠申請中',
    statusSummary: '長照給付申請已受理，照護機構評估報告審核中，預估 10 個工作天內通知結果。',
    isError: false,
    updatedAt: '2026-07-06',
  },
  // 進行中：王建國意外理賠核准待給付
  p8: {
    claimStatus: 'approved',
    progress: 88,
    statusLabel: '核准待給付',
    statusSummary: '意外理賠已核准 NT$ 420,000，預計 5 個工作天內匯入指定帳戶。',
    isError: false,
    updatedAt: '2026-07-07',
  },
  // 已完成：王雅婷醫療理賠已給付
  p7: {
    claimStatus: 'paid',
    progress: 100,
    statusLabel: '已給付',
    statusSummary: '醫療理賠款項 NT$ 128,400 已於 2026/07/12 匯入指定帳戶，本案結案。',
    isError: false,
    updatedAt: '2026-07-12',
  },
  // 已完成：王雅婷意外理賠（歷史結案）
  p4: {
    claimStatus: 'paid',
    progress: 100,
    statusLabel: '已給付',
    statusSummary: '意外醫療理賠款項 NT$ 86,500 已於 2026/06/15 匯入，本案結案。',
    isError: false,
    updatedAt: '2026-06-15',
  },
  // 已完成：王小美門診理賠駁回（保單仍有效，屬理賠結案而非保單到期）
  p18: {
    claimStatus: 'rejected',
    progress: 100,
    statusLabel: '理賠駁回',
    statusSummary:
      '門診手術費用不在保單給付範圍內，保險公司已寄發駁回函。如有疑義可於 30 日內提出申覆。',
    isError: false,
    updatedAt: '2026-06-20',
  },
}

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  in_review: '理賠申請中',
  pending_docs: '待補件',
  approved: '核准待給付',
  rejected: '理賠駁回',
  paid: '已給付',
  renewal: '續保提醒',
}

export const CLAIM_STATUS_ORDER: ClaimStatus[] = [
  'pending_docs',
  'in_review',
  'approved',
  'rejected',
  'paid',
]

export const CLAIM_STATUS_GROUP: Record<
  ClaimStatus,
  { title: string; tone: 'danger' | 'warning' | 'info' | 'success' }
> = {
  pending_docs: { title: '待補件 · 需立即處理', tone: 'danger' },
  rejected: { title: '理賠駁回 · 可申覆', tone: 'danger' },
  renewal: { title: '續保提醒', tone: 'warning' },
  in_review: { title: '理賠申請中', tone: 'success' },
  approved: { title: '核准待給付', tone: 'success' },
  paid: { title: '已給付', tone: 'success' },
}

/** 需產生系統待辦的理賠狀態（已給付除外） */
export const CLAIM_TODO_STATUSES: ClaimStatus[] = [
  'pending_docs',
  'in_review',
  'approved',
  'rejected',
]

export const CLAIM_TODO_TITLES: Partial<Record<ClaimStatus, (claim: ClaimRecord) => string>> = {
  pending_docs: (claim) => `補齊「${claim.policyName}」理賠文件`,
  in_review: (claim) => `追蹤「${claim.policyName}」理賠進度`,
  approved: (claim) => `確認「${claim.policyName}」理賠給付`,
  rejected: (claim) => `處理「${claim.policyName}」理賠駁回`,
}

function resolveClaimTemplate(policy: Policy): ClaimTemplate | null {
  if (policy.status !== 'active') return null
  return CLAIM_BY_POLICY[policy.id] ?? null
}

export function buildFamilyClaims(members: FamilyMember[]): ClaimRecord[] {
  const records: ClaimRecord[] = []

  for (const member of members) {
    for (const policy of member.policies) {
      const template = resolveClaimTemplate(policy)
      if (!template) continue

      records.push({
        id: `claim-${policy.id}`,
        policyId: policy.id,
        memberId: member.id,
        memberName: member.name,
        avatarSeed: member.avatarSeed,
        policyName: policy.name,
        insurer: policy.insurer,
        eventLabel: EVENT_LABELS[policy.type],
        eventType: policy.type,
        amount: policy.eventPayout > 0 ? policy.eventPayout : policy.coverage,
        ...template,
        statusLabel: CLAIM_STATUS_LABELS[template.claimStatus],
      })
    }
  }

  return records.sort((a, b) => {
    const order = CLAIM_STATUS_ORDER.indexOf(a.claimStatus) - CLAIM_STATUS_ORDER.indexOf(b.claimStatus)
    if (order !== 0) return order
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

export function getClaimByPolicyId(
  members: FamilyMember[],
  policyId: string,
): ClaimRecord | undefined {
  return buildFamilyClaims(members).find((claim) => claim.policyId === policyId)
}

export type ClaimTab = 'pending' | 'in_progress' | 'completed'

export const CLAIM_TAB_STATUSES: Record<ClaimTab, ClaimStatus[]> = {
  pending: ['pending_docs'],
  in_progress: ['in_review', 'approved'],
  completed: ['paid', 'rejected'],
}

export const CLAIM_TAB_LABELS: Record<ClaimTab, string> = {
  pending: '待處理',
  in_progress: '進行中',
  completed: '已結案',
}

export function countClaimsByTab(claims: ClaimRecord[]) {
  return (Object.keys(CLAIM_TAB_STATUSES) as ClaimTab[]).reduce(
    (counts, tab) => {
      const statuses = CLAIM_TAB_STATUSES[tab]
      counts[tab] = claims.filter((claim) => statuses.includes(claim.claimStatus)).length
      return counts
    },
    { pending: 0, in_progress: 0, completed: 0 } as Record<ClaimTab, number>,
  )
}

export function groupClaimsByStatus(claims: ClaimRecord[], tab?: ClaimTab) {
  const statuses = tab ? CLAIM_TAB_STATUSES[tab] : CLAIM_STATUS_ORDER
  return statuses
    .map((status) => ({
      status,
      ...CLAIM_STATUS_GROUP[status],
      items: claims.filter((claim) => claim.claimStatus === status),
    }))
    .filter((group) => group.items.length > 0)
}

/** 理賠頁導覽徽章：僅計入需使用者補件的案件 */
export function countClaimActionItems(claims: ClaimRecord[]): number {
  return claims.filter((claim) => claim.claimStatus === 'pending_docs').length
}