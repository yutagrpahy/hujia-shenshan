import { Tooltip } from '@heroui/react'
import { Link2 } from 'lucide-react'
import { useState } from 'react'
import {
  getPolicySourceDescription,
  MANUAL_POLICY_CHIP_LABEL,
  UNION_POLICY_CHIP_LABEL,
} from '../../data/policySourceLabels'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type { PolicySource } from '../../types'

function PolicySourceTag({ source }: { source: PolicySource }) {
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

export function PolicySourceLabel({ source }: { source: PolicySource }) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const [open, setOpen] = useState(false)
  const description = getPolicySourceDescription(source)

  return (
    <Tooltip
      delay={isMobile ? 0 : 250}
      closeDelay={isMobile ? 0 : 100}
      isOpen={isMobile ? open : undefined}
      onOpenChange={isMobile ? setOpen : undefined}
    >
      <Tooltip.Trigger
        role="presentation"
        className="policy-source-tag__trigger"
        onClick={(event) => {
          if (!isMobile) return
          event.preventDefault()
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        onPointerDown={(event) => {
          if (isMobile) event.stopPropagation()
        }}
      >
        <PolicySourceTag source={source} />
      </Tooltip.Trigger>
      <Tooltip.Content placement="top" offset={8} className="policy-source-tooltip">
        {description}
      </Tooltip.Content>
    </Tooltip>
  )
}