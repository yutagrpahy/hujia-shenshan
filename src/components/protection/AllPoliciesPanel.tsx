import { useMemo, useState } from 'react'
import { UNION_INFO_SYSTEM_NAME } from '../../data/policySourceLabels'
import { groupPoliciesByGapCategory } from '../../utils/calculations'
import type { FamilyMember, PolicyWithMember } from '../../types'
import { CardEmptyState, CardSectionTitle, PageStack, Section } from '../common/CardLayout'
import { PolicyListCardFromItem } from '../common/PolicyListCard'
import {
  PolicyCategoryFilterChips,
  type PolicyCategoryFilterKey,
} from './PolicyCategoryFilterChips'

export function AllPoliciesPanel({
  members,
  onSelectPolicy,
}: {
  members: FamilyMember[]
  onSelectPolicy: (item: PolicyWithMember) => void
}) {
  const [activeFilter, setActiveFilter] = useState<PolicyCategoryFilterKey>('all')
  const groups = useMemo(() => groupPoliciesByGapCategory(members), [members])
  const totalPolicies = useMemo(
    () => groups.reduce((sum, group) => sum + group.policies.length, 0),
    [groups],
  )
  const groupsWithPolicies = useMemo(
    () => groups.filter((group) => group.policies.length > 0),
    [groups],
  )
  const filteredGroups = useMemo(() => {
    if (activeFilter === 'all') return groupsWithPolicies
    return groupsWithPolicies.filter((group) => group.gapKey === activeFilter)
  }, [groupsWithPolicies, activeFilter])

  if (totalPolicies === 0) {
    return (
      <CardEmptyState
        title="全家尚無保單資料"
        description={`可至各成員詳情自行登載，或等待${UNION_INFO_SYSTEM_NAME}同步`}
      />
    )
  }

  return (
    <PageStack>
      <PolicyCategoryFilterChips
        groups={groups}
        totalPolicies={totalPolicies}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {filteredGroups.length === 0 ? (
        <p className="text-sm text-gray-400 m3-card m3-card-item">此類別尚無保單</p>
      ) : (
        filteredGroups.map((group) => (
          <Section key={group.gapKey}>
            <CardSectionTitle count={`${group.policies.length} 張`}>
              {group.category}
            </CardSectionTitle>
            {group.policies.map((item) => (
              <PolicyListCardFromItem
                key={`${item.memberId}-${item.policy.id}`}
                item={item}
                members={members}
                onSelect={onSelectPolicy}
              />
            ))}
          </Section>
        ))
      )}
    </PageStack>
  )
}