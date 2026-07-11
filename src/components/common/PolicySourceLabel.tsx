import { Link2 } from 'lucide-react'
import {
  MANUAL_POLICY_CHIP_LABEL,
  UNION_POLICY_CHIP_LABEL,
} from '../../data/policySourceLabels'
import type { PolicySource } from '../../types'

export function PolicySourceLabel({ source }: { source: PolicySource }) {
  if (source === 'union') {
    return (
      <span className="policy-source-tag policy-source-tag--union">
        <Link2 className="w-3 h-3 shrink-0" aria-hidden />
        {UNION_POLICY_CHIP_LABEL}
      </span>
    )
  }

  return (
    <span className="policy-source-tag policy-source-tag--manual">
      {MANUAL_POLICY_CHIP_LABEL}
    </span>
  )
}