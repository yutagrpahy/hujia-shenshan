import type { PolicyCategoryGroup } from '../../types'

export type PolicyCategoryFilterKey = PolicyCategoryGroup['gapKey'] | 'all'

export function PolicyCategoryFilterChips({
  groups,
  totalPolicies,
  activeFilter,
  onFilterChange,
}: {
  groups: PolicyCategoryGroup[]
  totalPolicies: number
  activeFilter: PolicyCategoryFilterKey
  onFilterChange: (filter: PolicyCategoryFilterKey) => void
}) {
  const groupsWithPolicies = groups.filter((group) => group.policies.length > 0)

  return (
    <div className="policy-filter-chips" role="group" aria-label="保障類型篩選">
      <button
        type="button"
        onClick={() => onFilterChange('all')}
        className={`m3-chip ${activeFilter === 'all' ? 'm3-chip--selected' : 'm3-chip--muted'}`}
        aria-pressed={activeFilter === 'all'}
      >
        全部 ({totalPolicies})
      </button>
      {groupsWithPolicies.map((group) => (
        <button
          key={group.gapKey}
          type="button"
          onClick={() => onFilterChange(group.gapKey)}
          className={`m3-chip ${
            activeFilter === group.gapKey ? 'm3-chip--selected' : 'm3-chip--muted'
          }`}
          aria-pressed={activeFilter === group.gapKey}
        >
          {group.category} ({group.policies.length})
        </button>
      ))}
    </div>
  )
}