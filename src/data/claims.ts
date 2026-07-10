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

const CLAIM_BY_POLICY: Record<string, ClaimTemplate> = {
  // DEMO: 王雅婷 p7 理賠完成後 — 復原待補件時改回 pending_docs / progress 42
  p7: {
    claimStatus: 'paid',
    progress: 100,
    statusLabel: '已給付',
    statusSummary: '醫療理賠款項 NT$ 128,400 已於 2026/07/12 匯入指定帳戶，本案結案。',
    isError: false,
    updatedAt: '2026-07-12',
  },
  p1: {
    claimStatus: 'in_review',
    progress: 68,
    statusLabel: '申請理賠中',
    statusSummary: '身故理賠案件已受理，目前進行保單與受益人資料核對。',
    isError: false,
    updatedAt: '2026-07-08',
  },
  p3: {
    claimStatus: 'in_review',
    progress: 55,
    statusLabel: '申請理賠中',
    statusSummary: '長照給付申請已受理，照護機構評估報告審核中。',
    isError: false,
    updatedAt: '2026-07-06',
  },
  p8: {
    claimStatus: 'approved',
    progress: 88,
    statusLabel: '核准待給付',
    statusSummary: '意外理賠已核准，預計 5 個工作天內匯入指定帳戶。',
    isError: false,
    updatedAt: '2026-07-07',
  },
  p4: {
    claimStatus: 'paid',
    progress: 100,
    statusLabel: '已給付',
    statusSummary: '理賠款項已匯入，請留意帳戶入帳通知。',
    isError: false,
    updatedAt: '2026-06-15',
  },
}

const POLICY_STATUS_FALLBACK: Partial<
  Record<Policy['status'], Omit<ClaimTemplate, 'updatedAt'> & { updatedAt?: string }>
> = {
  pending: {
    claimStatus: 'pending_docs',
    progress: 40,
    statusLabel: '待補件',
    statusSummary: '理賠審核需補充文件，請儘快聯繫業務員確認補件清單。',
    isError: true,
  },
  expiring: {
    claimStatus: 'renewal',
    progress: 75,
    statusLabel: '續保提醒',
    statusSummary: '保單即將到期，請安排續保以避免保障空窗。',
    isError: true,
  },
  expired: {
    claimStatus: 'rejected',
    progress: 100,
    statusLabel: '保單已到期',
    statusSummary: '保單已失效，無法受理新理賠，可洽業務員評估重新投保。',
    isError: true,
  },
}

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  in_review: '申請理賠中',
  pending_docs: '待補件',
  approved: '核准待給付',
  rejected: '理賠駁回',
  paid: '已給付',
  renewal: '續保提醒',
}

export const CLAIM_STATUS_ORDER: ClaimStatus[] = [
  'pending_docs',
  'rejected',
  'renewal',
  'in_review',
  'approved',
  'paid',
]

export const CLAIM_STATUS_GROUP: Record<
  ClaimStatus,
  { title: string; tone: 'danger' | 'warning' | 'info' | 'success' }
> = {
  pending_docs: { title: '待補件 · 需立即處理', tone: 'danger' },
  rejected: { title: '理賠異常 · 需關注', tone: 'danger' },
  renewal: { title: '續保提醒', tone: 'warning' },
  in_review: { title: '申請理賠中', tone: 'info' },
  approved: { title: '核准待給付', tone: 'info' },
  paid: { title: '已完成給付', tone: 'success' },
}

function resolveClaimTemplate(policy: Policy): ClaimTemplate | null {
  const statusFallback = POLICY_STATUS_FALLBACK[policy.status]
  if (statusFallback) {
    return {
      ...statusFallback,
      updatedAt: statusFallback.updatedAt ?? '2026-07-01',
    }
  }
  if (policy.status === 'active' && CLAIM_BY_POLICY[policy.id]) {
    return CLAIM_BY_POLICY[policy.id]
  }
  return null
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
  pending: ['pending_docs', 'rejected', 'renewal'],
  in_progress: ['in_review', 'approved'],
  completed: ['paid'],
}

export const CLAIM_TAB_LABELS: Record<ClaimTab, string> = {
  pending: '待處理',
  in_progress: '進行中',
  completed: '已完成',
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