import { Link2, PenLine } from 'lucide-react'
import { useMemo } from 'react'
import { MemberAvatar } from '../common/MemberAvatar'
import { groupPoliciesByGapCategory } from '../../utils/calculations'
import type { FamilyMember, Policy } from '../../types'

const POLICY_TYPE_LABELS: Record<Policy['type'], string> = {
  life: '壽險',
  health: '醫療',
  accident: '意外',
  longterm: '長照',
  savings: '年金',
  disability: '失能',
  critical: '重大疾病',
}

function PolicyCard({ item }: { item: ReturnType<typeof groupPoliciesByGapCategory>[number]['policies'][number] }) {
  const { policy, memberName, avatarSeed } = item

  return (
    <div
      className={`m3-card p-3 mb-2 w-full max-w-full min-w-0 ${
        policy.source === 'manual' ? 'border border-dashed border-sand-300 bg-sand-50/40' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2 min-w-0">
        <MemberAvatar name={memberName} seed={avatarSeed} size="sm" />
        <span className="text-xs font-medium text-teal-700 truncate">{memberName}</span>
      </div>
      <div className="flex items-center justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium block truncate">{policy.name}</span>
          <span className="text-[10px] text-gray-400">{policy.insurer}</span>
        </div>
        <span className="m3-chip bg-teal-50 text-teal-600 shrink-0">
          {POLICY_TYPE_LABELS[policy.type]}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        受益人：{policy.beneficiary} · 到期 {policy.expiryDate}
      </p>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {policy.source === 'union' ? (
          <span className="m3-chip bg-teal-50 text-teal-600 inline-flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            集保同步
          </span>
        ) : (
          <span className="m3-chip bg-sand-100 text-gray-600 inline-flex items-center gap-1 border border-dashed border-sand-300">
            <PenLine className="w-3 h-3" />
            自行登載
          </span>
        )}
        {policy.status === 'expiring' && (
          <span className="m3-chip bg-amber-50 text-amber-600">即將到期</span>
        )}
      </div>
    </div>
  )
}

export function AllPoliciesPanel({ members }: { members: FamilyMember[] }) {
  const groups = useMemo(() => groupPoliciesByGapCategory(members), [members])
  const totalPolicies = useMemo(
    () => groups.reduce((sum, group) => sum + group.policies.length, 0),
    [groups],
  )

  if (totalPolicies === 0) {
    return (
      <div className="m3-card p-8 text-center">
        <p className="text-sm text-gray-500">全家尚無保單資料</p>
        <p className="text-xs text-gray-400 mt-1">可至各成員詳情自行登載，或等待集保同步</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full max-w-full min-w-0">
      {groups.map((group) => (
        <section key={group.gapKey} className="w-full max-w-full min-w-0">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {group.category}
            </h3>
            <span className="text-[10px] text-gray-400">{group.policies.length} 張</span>
          </div>
          {group.policies.length === 0 ? (
            <p className="text-sm text-gray-400 m3-card p-4">此類別尚無保單</p>
          ) : (
            group.policies.map((item) => (
              <PolicyCard key={`${item.memberId}-${item.policy.id}`} item={item} />
            ))
          )}
        </section>
      ))}
    </div>
  )
}