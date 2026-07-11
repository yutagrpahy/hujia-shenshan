import {
  CLAIM_STATUS_GROUP,
  CLAIM_STATUS_LABELS,
  CLAIM_TODO_STATUSES,
} from './claims'
import type { ClaimRecord, Policy } from '../types'

/** 保單卡片標籤狀態觸發的系統待辦（與 getPolicyCardStatusChip 對齊） */
export type PolicySystemTodoTrigger =
  | { kind: 'renewal'; policy: Policy }
  | { kind: 'expired'; policy: Policy }
  | { kind: 'pending'; policy: Policy }
  | { kind: 'claim_docs'; claim: ClaimRecord }

export function isPolicyReapplication(policy: Policy): boolean {
  return policy.status === 'pending' && !!policy.reapplyOf
}

export function isPolicyUnderwriting(policy: Policy): boolean {
  return policy.status === 'pending' && policy.coverage <= 0 && policy.type === 'life'
}

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
  if (policy.status === 'active') return null

  if (policy.status === 'pending') {
    if (isPolicyReapplication(policy)) {
      return {
        label: '重新投保申請中',
        className: 'policy-status-chip policy-status-chip--pending-reapply',
        tone: 'warning',
      }
    }
    if (isPolicyUnderwriting(policy)) {
      return {
        label: '核保中',
        className: 'policy-status-chip policy-status-chip--pending',
        tone: 'warning',
      }
    }
    return {
      label: '申請待補件',
      className: 'policy-status-chip policy-status-chip--pending-docs',
      tone: 'danger',
    }
  }

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

/**
 * 依保單卡片標籤判斷是否產生系統待辦。
 * 有效／到期自動續保／理賠進行中／理賠已結案 → 不產生。
 * 即將到期、已失效、核保中／申請待補件、理賠待補件 → 產生。
 */
export function resolvePolicySystemTodoTrigger(
  policy: Policy,
  claim?: ClaimRecord | null,
): PolicySystemTodoTrigger | null {
  if (claim) {
    if (CLAIM_TODO_STATUSES.includes(claim.claimStatus)) {
      return { kind: 'claim_docs', claim }
    }
    return null
  }

  if (policy.status === 'pending') {
    return { kind: 'pending', policy }
  }

  if (policy.status === 'expiring' && !policy.autoRenew) {
    return { kind: 'renewal', policy }
  }

  if (policy.status === 'expired') {
    return { kind: 'expired', policy }
  }

  return null
}