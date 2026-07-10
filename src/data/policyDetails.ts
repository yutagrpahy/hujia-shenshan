import { getClaimByPolicyId } from './claims'
import {
  MANUAL_POLICY_CHIP_LABEL,
  UNION_INFO_SYSTEM_NAME,
} from './policySourceLabels'
import type {
  AdvisorRecommendation,
  ClaimRecord,
  ClaimStatus,
  FamilyMember,
  Policy,
  PolicyWithMember,
} from '../types'
import { formatCurrency } from '../utils/calculations'

export interface PolicyDetailCta {
  id: string
  label: string
  description: string
  variant: 'primary' | 'secondary'
}

export interface PolicyDetailContext {
  policy: Policy
  memberName: string
  memberId: string
  avatarSeed: string
  statusLabel: string
  statusTone: 'success' | 'warning' | 'danger' | 'info'
  situationTitle: string
  situationSummary: string
  detailRows: Array<{ label: string; value: string }>
  ctas: PolicyDetailCta[]
  agent: AdvisorRecommendation
}

const POLICY_TYPE_LABELS: Record<Policy['type'], string> = {
  life: '壽險',
  health: '醫療',
  accident: '意外',
  longterm: '長照',
  savings: '年金',
  disability: '失能',
  critical: '重大疾病',
}

const DEFAULT_AGENT: AdvisorRecommendation = {
  name: '林佳蓉',
  title: '南山人壽資深保障顧問',
  phone: '02-2345-6789',
  reason: '專精家庭保障整合，可協助續保、理賠與保單變更',
}

const AGENTS_BY_INSURER: Record<string, AdvisorRecommendation> = {
  國泰人壽: {
    name: '陳柏翰',
    title: '國泰人壽業務襄理',
    phone: '0911-222-333',
    reason: '服務王建國家族壽險與醫療附約，熟悉續保與受益人變更',
  },
  富邦人壽: {
    name: '張雅琪',
    title: '富邦人壽資深業務員',
    phone: '0922-333-444',
    reason: '專長醫療險與長照險規劃，可協助到期續保評估',
  },
  南山人壽: DEFAULT_AGENT,
  台灣人壽: {
    name: '李志明',
    title: '台灣人壽理賠服務專員',
    phone: '0933-444-555',
    reason: '熟悉實支實付理賠流程，可協助補件與進度查詢',
  },
  全球人壽: {
    name: '吳佩珊',
    title: '全球人壽保障顧問',
    phone: '0944-555-666',
    reason: '專精防癌險與年金規劃，提供保單健檢建議',
  },
  新光人壽: {
    name: '黃俊豪',
    title: '新光人壽業務主任',
    phone: '0955-666-777',
    reason: '失能與長照保障規劃，可安排到府說明',
  },
  新安東京海上: {
    name: '周曉雯',
    title: '產險業務代表',
    phone: '0966-777-888',
    reason: '旅平險與意外險專責，協助自行登載保單確認與續保',
  },
}

function getAgent(insurer: string): AdvisorRecommendation {
  return AGENTS_BY_INSURER[insurer] ?? {
    ...DEFAULT_AGENT,
    reason: `負責 ${insurer} 相關保單的續保、理賠與變更諮詢`,
  }
}

function formatCoverage(policy: Policy): string {
  if (policy.monthlyPayout > 0) {
    return `月給付 ${formatCurrency(policy.monthlyPayout)}`
  }
  if (policy.coverage > 0) {
    return formatCurrency(policy.coverage)
  }
  if (policy.status === 'pending') {
    return '保額 0 元（核保／待生效）'
  }
  return '保額 0 元'
}

function buildClaimScenario(
  claim: ClaimRecord,
): Pick<
  PolicyDetailContext,
  'statusLabel' | 'statusTone' | 'situationTitle' | 'situationSummary' | 'ctas'
> | null {
  const scenarios: Partial<
    Record<
      ClaimStatus,
      Pick<
        PolicyDetailContext,
        'statusLabel' | 'statusTone' | 'situationTitle' | 'situationSummary' | 'ctas'
      >
    >
  > = {
    in_review: {
      statusLabel: '申請理賠中',
      statusTone: 'info',
      situationTitle: '補件完成 · 審核進行中',
      situationSummary:
        '您已完成補件，診斷證明與費用明細已收齊。理賠案件目前由核保單位審核，預估 7–14 個工作天內通知結果。',
      ctas: [
        {
          id: 'track-claim',
          label: '追蹤理賠進度',
          description: '示意：查看審核階段與預估完成時間',
          variant: 'primary',
        },
        {
          id: 'call-agent',
          label: '聯絡保險業務員',
          description: '確認審核進度或補充說明',
          variant: 'secondary',
        },
      ],
    },
    pending_docs: {
      statusLabel: '待補件',
      statusTone: 'danger',
      situationTitle: '理賠審核中 · 需補充文件',
      situationSummary: claim.statusSummary,
      ctas: [
        {
          id: 'upload-docs',
          label: '上傳證明文件',
          description: '示意：上傳診斷書、收據與費用清單',
          variant: 'primary',
        },
        {
          id: 'ask-agent',
          label: '請洽詢保險業務員',
          description: '確認補件格式與理賠進度',
          variant: 'secondary',
        },
      ],
    },
    approved: {
      statusLabel: '核准待給付',
      statusTone: 'info',
      situationTitle: '理賠核准',
      situationSummary: claim.statusSummary,
      ctas: [
        {
          id: 'track-payout',
          label: '查詢給付進度',
          description: '示意：確認匯款帳戶與入帳時間',
          variant: 'primary',
        },
        {
          id: 'call-agent',
          label: '聯絡保險業務員',
          description: '給付相關問題諮詢',
          variant: 'secondary',
        },
      ],
    },
    paid: {
      statusLabel: '已給付',
      statusTone: 'success',
      situationTitle: '理賠完成 · 本案結案',
      situationSummary: claim.statusSummary,
      ctas: [
        {
          id: 'download-receipt',
          label: '下載給付明細',
          description: '示意：匯款紀錄與理賠結案通知',
          variant: 'primary',
        },
        {
          id: 'call-agent',
          label: '聯絡保險業務員',
          description: '後續保障檢視或續保諮詢',
          variant: 'secondary',
        },
      ],
    },
  }

  return scenarios[claim.claimStatus] ?? null
}

function buildScenario(
  policy: Policy,
  claim?: ClaimRecord,
): Pick<
  PolicyDetailContext,
  'statusLabel' | 'statusTone' | 'situationTitle' | 'situationSummary' | 'ctas'
> {
  if (policy.status === 'active' && claim) {
    const claimScenario = buildClaimScenario(claim)
    if (claimScenario) return claimScenario
  }

  if (policy.status === 'expiring') {
    return {
      statusLabel: '即將到期',
      statusTone: 'warning',
      situationTitle: '續保提醒',
      situationSummary: `此保單將於 ${policy.expiryDate} 到期。建議提前 30 天聯繫業務員評估續保條件，避免保障空窗期影響醫療理賠。`,
      ctas: [
        {
          id: 'renew',
          label: '預約續保諮詢',
          description: '由業務員協助比較續保與轉換方案',
          variant: 'primary',
        },
        {
          id: 'call-agent',
          label: '聯絡保險業務員',
          description: '電話或 LINE 預約回電',
          variant: 'secondary',
        },
      ],
    }
  }

  if (policy.status === 'pending') {
    return {
      statusLabel: '待補件',
      statusTone: 'danger',
      situationTitle: '理賠審核中 · 需補充文件',
      situationSummary:
        '您的理賠申請已受理，但審核單位通知需補充診斷證明與費用明細。請於 14 天內完成補件，以免案件逾期結案。',
      ctas: [
        {
          id: 'upload-docs',
          label: '上傳證明文件',
          description: '示意：上傳診斷書、收據與費用清單',
          variant: 'primary',
        },
        {
          id: 'ask-agent',
          label: '請洽詢保險業務員',
          description: '確認補件格式與理賠進度',
          variant: 'secondary',
        },
      ],
    }
  }

  if (policy.status === 'expired') {
    return {
      statusLabel: '已到期',
      statusTone: 'danger',
      situationTitle: '保障已終止',
      situationSummary: `保單已於 ${policy.expiryDate} 到期，目前無法受理新的理賠。若仍有保障需求，建議重新評估投保方案。`,
      ctas: [
        {
          id: 'reapply',
          label: '申請重新投保',
          description: '示意：由業務員協助核保與報價',
          variant: 'primary',
        },
        {
          id: 'call-agent',
          label: '聯絡保險業務員',
          description: '了解重新投保條件與等待期',
          variant: 'secondary',
        },
      ],
    }
  }

  if (policy.source === 'manual') {
    return {
      statusLabel: '自行登載',
      statusTone: 'info',
      situationTitle: '保單資料待確認',
      situationSummary:
        '此保單為自行登載，建議向原投保窗口確認保障內容、到期日與理賠方式，以確保家庭保障地圖完整。',
      ctas: [
        {
          id: 'verify',
          label: '請業務員協助確認',
          description: '核對保單號碼與保障範圍',
          variant: 'primary',
        },
        {
          id: 'beneficiary',
          label: '更新受益人資料',
          description: '示意：同步至家庭文件庫',
          variant: 'secondary',
        },
      ],
    }
  }

  if (policy.type === 'life') {
    return {
      statusLabel: '保障中',
      statusTone: 'success',
      situationTitle: '保單正常有效',
      situationSummary:
        '保單目前有效。若家庭成員、財務狀況有變動，可請業務員協助檢視受益人配置與保額是否仍符合需求。',
      ctas: [
        {
          id: 'beneficiary-review',
          label: '預約受益人檢視',
          description: '確認身故受益人與分配比例',
          variant: 'primary',
        },
        {
          id: 'call-agent',
          label: '聯絡保險業務員',
          description: '保單變更或保障加強諮詢',
          variant: 'secondary',
        },
      ],
    }
  }

  return {
    statusLabel: '保障中',
    statusTone: 'success',
    situationTitle: '保單正常有效',
    situationSummary:
      '保單目前有效。如有理賠申請、保障調整或保費繳納疑問，可直接聯繫專屬業務員。',
    ctas: [
      {
        id: 'claim-guide',
        label: '理賠申請指引',
        description: '示意：查看申請步驟與應備文件',
        variant: 'primary',
      },
      {
        id: 'call-agent',
        label: '聯絡保險業務員',
        description: '電話諮詢或預約到府服務',
        variant: 'secondary',
      },
    ],
  }
}

export function buildPolicyDetailContext(
  item: PolicyWithMember,
  members?: FamilyMember[],
): PolicyDetailContext {
  const { policy, memberId, memberName, avatarSeed } = item
  const claim = members ? getClaimByPolicyId(members, policy.id) : undefined
  const scenario = buildScenario(policy, claim)

  return {
    policy,
    memberId,
    memberName,
    avatarSeed,
    agent: getAgent(policy.insurer),
    ...scenario,
    detailRows: [
      { label: '保險公司', value: policy.insurer },
      { label: '保單類型', value: POLICY_TYPE_LABELS[policy.type] },
      { label: '保障內容', value: formatCoverage(policy) },
      { label: '月繳保費', value: policy.premium > 0 ? formatCurrency(policy.premium) : '—' },
      { label: '受益人', value: policy.beneficiary },
      { label: '到期日', value: policy.expiryDate },
      {
        label: '資料來源',
        value: policy.source === 'union' ? UNION_INFO_SYSTEM_NAME : MANUAL_POLICY_CHIP_LABEL,
      },
    ],
  }
}