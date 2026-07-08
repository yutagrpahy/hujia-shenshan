import { Modal } from '@heroui/react'
import { ChevronDown, ChevronRight, ChevronUp, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import type { AccidentPayoutGroup, AccidentPayoutItem, FamilyMember } from '../../types'
import { formatCurrency, groupAccidentPayouts } from '../../utils/calculations'
import { MemberAvatar } from '../common/MemberAvatar'

const VISIBLE_LIMIT = 5

export function AccidentPayoutPanel({
  items,
  members,
}: {
  items: AccidentPayoutItem[]
  members: FamilyMember[]
}) {
  const groups = useMemo(() => groupAccidentPayouts(items), [items])
  const [expanded, setExpanded] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<AccidentPayoutGroup | null>(null)
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

  const visibleGroups = expanded ? groups : groups.slice(0, VISIBLE_LIMIT)
  const hasMore = groups.length > VISIBLE_LIMIT

  const findMember = (name: string) => members.find((m) => m.name === name)

  if (groups.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs font-medium text-gray-600">意外理賠（潛在可理賠保障）</span>
        </div>
        <p className="text-xs text-gray-400 px-1">尚無可理賠保障項目</p>
      </div>
    )
  }

  return (
    <>
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-xs font-medium text-gray-600">意外理賠（潛在可理賠保障）</span>
        </div>
        <div className="space-y-2">
          {visibleGroups.map((group) => (
            <button
              key={group.eventType}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className="m3-card p-3 bg-warm-50 w-full flex items-center justify-between gap-3 active:bg-sand-50 text-left transition-colors hover:bg-sand-50/80"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800">{group.eventLabel}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {group.memberNames.length} 位成員 · {group.items.length} 張保單
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <p className="text-sm font-bold text-teal-700">
                  {formatCurrency(group.totalAmount)}
                </p>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </button>
          ))}
        </div>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="w-full mt-2 py-2 text-xs font-medium text-teal-600 flex items-center justify-center gap-1 hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                收合
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                展開其餘 {groups.length - VISIBLE_LIMIT} 類
              </>
            )}
          </button>
        )}
      </div>

      <Modal.Backdrop
        isOpen={!!selectedGroup}
        onOpenChange={(open) => !open && setSelectedGroup(null)}
      >
        <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{selectedGroup?.eventLabel}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {selectedGroup && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    合計 {formatCurrency(selectedGroup.totalAmount)} ·{' '}
                    {selectedGroup.items.length} 張保單 · {selectedGroup.memberNames.length} 位成員
                  </p>
                  <div className="space-y-2">
                    {selectedGroup.items.map((item) => {
                      const member = findMember(item.memberName)
                      return (
                        <div key={item.id} className="m3-card p-3 flex items-start gap-3">
                          {member ? (
                            <MemberAvatar
                              name={member.name}
                              seed={member.avatarSeed}
                              size="sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-50 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800">{item.memberName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.insurer}</p>
                            <p className="text-[10px] text-gray-400 truncate">{item.policyName}</p>
                          </div>
                          <p className="text-sm font-semibold text-teal-700 shrink-0">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}