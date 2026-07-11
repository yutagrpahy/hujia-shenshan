import type { PolicySource } from '../types'

/** 個人頁綁定之保單資料來源（正式名稱） */
export const UNION_INFO_SYSTEM_NAME = '中華民國保險商業同業公會之資訊系統'

/** 保單卡片 chip 等空間有限處 */
export const UNION_POLICY_CHIP_LABEL = '同業公會資訊系統'

export const MANUAL_POLICY_CHIP_LABEL = '自行登載'

export function getPolicySourceChipLabel(source: PolicySource): string {
  return source === 'union' ? UNION_POLICY_CHIP_LABEL : MANUAL_POLICY_CHIP_LABEL
}

/** 保單來源標籤 Tooltip 說明（對照原 legend 文案） */
export const UNION_POLICY_SOURCE_DESCRIPTION =
  '保單資料來自定中華民國保險業同業公會之系統'

export const MANUAL_POLICY_SOURCE_DESCRIPTION = '該成員自行登載之保單'

export function getPolicySourceDescription(source: PolicySource): string {
  return source === 'union'
    ? UNION_POLICY_SOURCE_DESCRIPTION
    : MANUAL_POLICY_SOURCE_DESCRIPTION
}