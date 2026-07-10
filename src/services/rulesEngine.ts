import { buildFamilyClaims } from '../data/claims'
import { calculateGapPercent, computeCoverageSummary } from '../utils/calculations'
import type {
  AppNotification,
  FamilyMember,
  Policy,
  ProtectionLifeProfile,
  TodoItem,
} from '../types'

/** 缺口達成率低於此值時自動產生補強待辦 */
const GAP_TODO_THRESHOLD_PERCENT = 50

const DEFAULT_PENDING_COVERAGE: Partial<Record<Policy['type'], number>> = {
  life: 3000000,
  health: 1000000,
  critical: 1000000,
}

export interface TodoCompletionResult {
  persistedTodos: TodoItem[]
  members: FamilyMember[]
  dismissedRuleIds: Set<string>
  completed: TodoItem | null
}

function extendExpiryDate(expiryDate: string): string {
  if (expiryDate === '終身' || expiryDate === '未填寫') return expiryDate
  const parsed = new Date(expiryDate)
  if (Number.isNaN(parsed.getTime())) return expiryDate
  parsed.setFullYear(parsed.getFullYear() + 1)
  return parsed.toISOString().split('T')[0]
}

function updatePolicy(
  members: FamilyMember[],
  policyId: string,
  patch: Partial<Policy>,
): FamilyMember[] {
  return members.map((member) => ({
    ...member,
    policies: member.policies.map((policy) =>
      policy.id === policyId ? { ...policy, ...patch } : policy,
    ),
  }))
}

function findPolicyOwner(members: FamilyMember[], policyId: string) {
  for (const member of members) {
    if (member.policies.some((policy) => policy.id === policyId)) {
      return member
    }
  }
  return undefined
}

function formatPolicyExpiry(expiryDate: string): string {
  if (expiryDate === '終身' || expiryDate === '未填寫') return expiryDate
  return expiryDate.replace(/-/g, '/')
}

export function deriveSystemTodos(
  members: FamilyMember[],
  profile: ProtectionLifeProfile,
  dismissedRuleIds: ReadonlySet<string>,
): TodoItem[] {
  const todos: TodoItem[] = []
  const owner = members.find((member) => member.role === 'owner') ?? members[0]

  for (const member of members) {
    for (const policy of member.policies) {
      if (policy.status === 'expiring') {
        const ruleId = `renewal:${policy.id}`
        if (dismissedRuleIds.has(ruleId)) continue
        todos.push({
          id: `sys-${ruleId}`,
          ruleId,
          title: `續保「${policy.insurer}${policy.name}」`,
          memberId: member.id,
          memberName: member.name,
          policyId: policy.id,
          urgency: 'high',
          dueDate: policy.expiryDate,
          completed: false,
          source: 'system',
        })
      }

      if (policy.status === 'pending') {
        const ruleId = `pending:${policy.id}`
        if (dismissedRuleIds.has(ruleId)) continue
        const isUnderwriting = policy.coverage <= 0 && policy.type === 'life'
        todos.push({
          id: `sys-${ruleId}`,
          ruleId,
          title: isUnderwriting
            ? `追蹤「${policy.name}」核保進度`
            : `補齊「${policy.name}」申請文件`,
          memberId: member.id,
          memberName: member.name,
          policyId: policy.id,
          urgency: 'high',
          dueDate: policy.expiryDate,
          completed: false,
          source: 'system',
        })
      }

      if (policy.status === 'expired') {
        const ruleId = `expired:${policy.id}`
        if (dismissedRuleIds.has(ruleId)) continue
        todos.push({
          id: `sys-${ruleId}`,
          ruleId,
          title: `重新投保「${policy.name}」`,
          memberId: member.id,
          memberName: member.name,
          policyId: policy.id,
          urgency: 'high',
          completed: false,
          source: 'system',
        })
      }
    }
  }

  const { gaps } = computeCoverageSummary(members, profile)
  for (const gap of gaps) {
    const achievement = calculateGapPercent(gap.current, gap.recommended)
    if (achievement >= GAP_TODO_THRESHOLD_PERCENT) continue

    const ruleId = `gap:${gap.gapKey}`
    if (dismissedRuleIds.has(ruleId)) continue

    const unitLabel = gap.unit.includes('月') ? gap.unit : gap.unit
    todos.push({
      id: `sys-${ruleId}`,
      ruleId,
      title: `補強家庭${gap.category}（目前 ${gap.current} ${unitLabel}）`,
      memberId: owner?.id ?? 'm1',
      memberName: owner?.name ?? '家庭',
      urgency: gap.current <= 0 ? 'high' : 'medium',
      dueDate: undefined,
      completed: false,
      source: 'system',
    })
  }

  const claims = buildFamilyClaims(members)
  for (const claim of claims) {
    if (claim.claimStatus !== 'pending_docs') continue
    const policy = findPolicyOwner(members, claim.policyId)?.policies.find(
      (item) => item.id === claim.policyId,
    )
    if (policy?.status === 'pending') continue

    const ruleId = `claim_docs:${claim.policyId}`
    if (dismissedRuleIds.has(ruleId)) continue

    todos.push({
      id: `sys-${ruleId}`,
      ruleId,
      title: `補齊「${claim.policyName}」理賠文件`,
      memberId: claim.memberId,
      memberName: claim.memberName,
      policyId: claim.policyId,
      urgency: 'high',
      dueDate: claim.updatedAt,
      completed: false,
      source: 'system',
    })
  }

  return todos
}

export function deriveNotifications(members: FamilyMember[]): AppNotification[] {
  const notifications: AppNotification[] = []

  for (const member of members) {
    for (const policy of member.policies) {
      if (policy.status === 'expiring') {
        notifications.push({
          id: `notif:policy-expiry:${policy.id}`,
          type: 'policy-expiry',
          title: '保單即將到期',
          message: `${member.name}的「${policy.insurer}${policy.name}」將於 ${formatPolicyExpiry(policy.expiryDate)} 到期`,
          date: policy.expiryDate,
          read: false,
          memberId: member.id,
        })
      }

      if (policy.status === 'pending') {
        const isUnderwriting = policy.coverage <= 0 && policy.type === 'life'
        notifications.push({
          id: `notif:policy-pending:${policy.id}`,
          type: 'policy-purchase',
          title: isUnderwriting ? '保單核保中' : '保單申請待補件',
          message: isUnderwriting
            ? `${member.name}的「${policy.name}」核保進行中，保額通過後將自動更新`
            : `${member.name}的「${policy.name}」申請需補齊文件，請儘快處理`,
          date: '2026-07-08',
          read: false,
          memberId: member.id,
        })
      }

      if (policy.status === 'expired') {
        notifications.push({
          id: `notif:policy-expired:${policy.id}`,
          type: 'policy-expiry',
          title: '保單已失效',
          message: `${member.name}的「${policy.name}」已到期，建議重新投保避免保障空窗`,
          date: policy.expiryDate,
          read: false,
          memberId: member.id,
        })
      }
    }
  }

  for (const claim of buildFamilyClaims(members)) {
    if (claim.claimStatus === 'paid') continue

    const policy = findPolicyOwner(members, claim.policyId)?.policies.find(
      (item) => item.id === claim.policyId,
    )
    if (policy?.status === 'expired' || policy?.status === 'expiring') continue

    notifications.push({
      id: `notif:claim:${claim.id}`,
      type: 'claim-progress',
      title: claim.statusLabel,
      message: `${claim.memberName}：${claim.statusSummary}`,
      date: claim.updatedAt,
      read: false,
      memberId: claim.memberId,
    })
  }

  return notifications.sort((a, b) => b.date.localeCompare(a.date))
}

export function mergeTodos(
  systemTodos: TodoItem[],
  persistedTodos: TodoItem[],
): TodoItem[] {
  const persistedPolicyRules = new Set(
    persistedTodos
      .map((todo) => todo.policyId)
      .filter((policyId): policyId is string => !!policyId),
  )

  const dedupedSystem = systemTodos.filter((todo) => {
    if (!todo.policyId) return true
    return !persistedPolicyRules.has(todo.policyId)
  })

  return [...dedupedSystem, ...persistedTodos]
}

function applySystemTodoCompletion(
  todo: TodoItem,
  members: FamilyMember[],
  dismissedRuleIds: Set<string>,
): { members: FamilyMember[]; dismissedRuleIds: Set<string> } {
  if (!todo.ruleId) {
    return { members, dismissedRuleIds }
  }

  const [kind, ref] = todo.ruleId.split(':')

  switch (kind) {
    case 'renewal': {
      const policy = findPolicyOwner(members, ref)?.policies.find((item) => item.id === ref)
      if (!policy) return { members, dismissedRuleIds }
      return {
        members: updatePolicy(members, ref, {
          status: 'active',
          expiryDate: extendExpiryDate(policy.expiryDate),
        }),
        dismissedRuleIds,
      }
    }
    case 'pending': {
      const policy = findPolicyOwner(members, ref)?.policies.find((item) => item.id === ref)
      if (!policy) return { members, dismissedRuleIds }
      const coverage =
        policy.coverage > 0
          ? policy.coverage
          : (DEFAULT_PENDING_COVERAGE[policy.type] ?? policy.eventPayout)
      return {
        members: updatePolicy(members, ref, {
          status: 'active',
          coverage,
          eventPayout: policy.eventPayout > 0 ? policy.eventPayout : coverage,
        }),
        dismissedRuleIds,
      }
    }
    case 'expired': {
      const policy = findPolicyOwner(members, ref)?.policies.find((item) => item.id === ref)
      if (!policy) return { members, dismissedRuleIds }
      const coverage = DEFAULT_PENDING_COVERAGE[policy.type] ?? 500000
      return {
        members: updatePolicy(members, ref, {
          status: 'active',
          coverage,
          eventPayout: coverage,
          expiryDate: extendExpiryDate(policy.expiryDate),
        }),
        dismissedRuleIds,
      }
    }
    case 'gap':
    case 'claim_docs': {
      const nextDismissed = new Set(dismissedRuleIds)
      nextDismissed.add(todo.ruleId)
      return { members, dismissedRuleIds: nextDismissed }
    }
    default:
      return { members, dismissedRuleIds }
  }
}

export function resolveTodoCompletion(
  id: string,
  persistedTodos: TodoItem[],
  members: FamilyMember[],
  profile: ProtectionLifeProfile,
  dismissedRuleIds: Set<string>,
): TodoCompletionResult | null {
  const persisted = persistedTodos.find((todo) => todo.id === id)
  if (persisted) {
    return {
      persistedTodos: persistedTodos.filter((todo) => todo.id !== id),
      members,
      dismissedRuleIds,
      completed: persisted,
    }
  }

  const systemTodos = deriveSystemTodos(members, profile, dismissedRuleIds)
  const system = systemTodos.find((todo) => todo.id === id)
  if (!system) return null

  const { members: nextMembers, dismissedRuleIds: nextDismissed } = applySystemTodoCompletion(
    system,
    members,
    dismissedRuleIds,
  )

  return {
    persistedTodos,
    members: nextMembers,
    dismissedRuleIds: nextDismissed,
    completed: system,
  }
}