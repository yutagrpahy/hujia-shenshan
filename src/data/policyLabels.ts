import type { Policy } from '../types'

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

export type PolicyStatusTone = 'success' | 'warning' | 'danger' | 'info'

export interface PolicyStatusChip {
  label: string
  className: string
  tone: PolicyStatusTone
}

export function getPolicyStatusChip(policy: Policy): PolicyStatusChip | null {
  if (policy.status === 'active') return null

  if (policy.status === 'expiring') {
    if (policy.autoRenew) {
      return {
        label: '到期自動續保',
        className: 'policy-status-chip policy-status-chip--renew-auto',
        tone: 'success',
      }
    }
    return {
      label: '到期不續保',
      className: 'policy-status-chip policy-status-chip--renew-none',
      tone: 'warning',
    }
  }

  if (policy.status === 'pending') {
    const isUnderwriting = policy.coverage <= 0 && policy.type === 'life'
    return {
      label: isUnderwriting ? '核保中' : '申請待補件',
      className: 'policy-status-chip policy-status-chip--pending',
      tone: 'warning',
    }
  }

  if (policy.status === 'expired') {
    return {
      label: '已失效',
      className: 'policy-status-chip policy-status-chip--expired',
      tone: 'danger',
    }
  }

  return null
}

export function getPolicyStatusLabel(policy: Policy): string {
  return getPolicyStatusChip(policy)?.label ?? POLICY_STATUS_LABELS.active
}