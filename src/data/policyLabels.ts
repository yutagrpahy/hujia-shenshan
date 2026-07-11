import { CLAIM_STATUS_GROUP, CLAIM_STATUS_LABELS } from './claims'
import type { ClaimRecord, Policy } from '../types'

export const POLICY_TYPE_LABELS: Record<Policy['type'], string> = {
  life: '壽險',
  health: '醫療',
  accident: '意外',
  longterm: '長照',
  savings: '年金',
  disability: '失能',
  critical: '重大疾病',
}

/** @deprecated 請改用 getPolicyStatusLabel */
export const POLICY_STATUS_LABELS: Record<Policy['status'], string> = {
  active: '有效',
  expiring: '即將到期',
  pending: '核保中',
  expired: '已失效',
}

/** @deprecated 請改用 getPolicyStatusChip */
export const POLICY_STATUS_BADGES: Partial<Record<Policy['status'], string>> = {
  expiring: 'bg-amber-50 text-amber-600',
  pending: 'bg-red-50 text-red-600',
  expired: 'bg-gray-100 text-gray-600',
}

export type PolicyStatusTone = 'success' | 'warning' | 'danger' | 'info' | 'muted'

export interface PolicyStatusChip {
  label: string
  className: string
  tone: PolicyStatusTone
}

export function getPolicyStatusChip(policy: Policy): PolicyStatusChip | null {
  if (policy.status === 'active' || policy.status === 'pending') return null

  if (policy.status === 'expiring') {
    if (policy.autoRenew) {
      return {
        label: '到期自動續保',
        className: 'policy-status-chip policy-status-chip--renew-auto',
        tone: 'success',
      }
    }
    return {
      label: '即將到期',
      className: 'policy-status-chip policy-status-chip--expiring',
      tone: 'warning',
    }
  }

  if (policy.status === 'expired') {
    return {
      label: '已失效',
      className: 'policy-status-chip policy-status-chip--expired',
      tone: 'muted',
    }
  }

  return null
}

export function getPolicyStatusLabel(policy: Policy): string {
  return getPolicyStatusChip(policy)?.label ?? POLICY_STATUS_LABELS.active
}

export function getClaimStatusChip(claim: ClaimRecord): PolicyStatusChip {
  const tone = CLAIM_STATUS_GROUP[claim.claimStatus].tone
  return {
    label: CLAIM_STATUS_LABELS[claim.claimStatus],
    className: `claim-chip claim-chip--${tone}`,
    tone,
  }
}

/** 保單卡片：理賠狀態優先，否則顯示保單有效性狀態 */
export function getPolicyCardStatusChip(
  policy: Policy,
  claim?: ClaimRecord | null,
): PolicyStatusChip | null {
  if (claim) return getClaimStatusChip(claim)
  return getPolicyStatusChip(policy)
}