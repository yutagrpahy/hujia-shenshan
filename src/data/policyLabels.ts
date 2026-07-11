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

export const POLICY_STATUS_BADGES: Partial<Record<Policy['status'], string>> = {
  expiring: 'bg-amber-50 text-amber-600',
  pending: 'bg-red-50 text-red-600',
  expired: 'bg-gray-100 text-gray-600',
}

export const POLICY_STATUS_LABELS: Record<Policy['status'], string> = {
  active: '有效',
  expiring: '即將到期',
  pending: '核保中',
  expired: '已失效',
}