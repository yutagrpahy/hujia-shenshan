import { CLAIM_STATUS_GROUP, shouldShowClaimProgressRing, type ClaimTab } from '../../data/claims'
import {
  getPolicyApplicationProgress,
  shouldShowPolicyApplicationProgressRing,
} from '../../data/policyLabels'
import type { ClaimRecord, ClaimStatus, Policy } from '../../types'
import { CardItemTriIndicator } from './CardLayout'

const TONE_STROKES = {
  danger: '#d97055',
  warning: '#d97706',
  info: '#2d7a70',
  success: '#2d7a70',
  muted: '#5c6570',
}

export function claimRingTone(
  claimStatus: ClaimStatus,
  isError: boolean,
): keyof typeof TONE_STROKES {
  if (isError) return 'danger'
  return CLAIM_STATUS_GROUP[claimStatus].tone === 'success'
    ? 'success'
    : CLAIM_STATUS_GROUP[claimStatus].tone === 'danger'
      ? 'danger'
      : CLAIM_STATUS_GROUP[claimStatus].tone === 'warning'
        ? 'warning'
        : 'info'
}

function ClaimProgressRing({
  progress,
  tone = 'info',
  size = 40,
  label,
}: {
  progress: number
  tone?: keyof typeof TONE_STROKES
  size?: number
  label?: string
}) {
  const radius = 15.5
  const circumference = 2 * Math.PI * radius
  const dash = (Math.min(100, Math.max(0, progress)) / 100) * circumference

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#f3f1ed" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={TONE_STROKES[tone]}
          strokeWidth="3"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      {label ? (
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-gray-600">
          {label}
        </span>
      ) : null}
    </div>
  )
}

/**
 * 全站保單／理賠進度環唯一入口。
 * 理賠頁請傳入 claimsTab；總覽／保單列表依理賠狀態或投保中狀態判斷。
 */
export function ClaimProgressSlot({
  claim,
  policy,
  size = 44,
  claimsTab,
}: {
  claim?: ClaimRecord | null
  policy?: Policy | null
  size?: number
  claimsTab?: ClaimTab
}) {
  if (shouldShowClaimProgressRing(claim, { claimsTab })) {
    return (
      <CardItemTriIndicator>
        <ClaimProgressRing
          progress={claim!.progress}
          tone={claimRingTone(claim!.claimStatus, claim!.isError)}
          size={size}
          label={`${claim!.progress}%`}
        />
      </CardItemTriIndicator>
    )
  }

  if (shouldShowPolicyApplicationProgressRing(policy)) {
    const progress = getPolicyApplicationProgress(policy!)
    return (
      <CardItemTriIndicator>
        <ClaimProgressRing
          progress={progress}
          tone="success"
          size={size}
          label={`${progress}%`}
        />
      </CardItemTriIndicator>
    )
  }

  return null
}