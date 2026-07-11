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

/** 成員詳情保單區：與卡片標籤同風格的來源說明 */
export function PolicySourceLegend() {
  return (
    <div className="policy-source-legend">
      <span className="policy-source-legend__item">
        <PolicySourceLabel source="union" />
        <span className="policy-source-legend__text">
          保單資料來自定中華民國保險業同業公會之系統
        </span>
      </span>
      <span className="policy-source-legend__item">
        <PolicySourceLabel source="manual" />
        <span className="policy-source-legend__text">該成員自行登載之保單</span>
      </span>
    </div>
  )
}