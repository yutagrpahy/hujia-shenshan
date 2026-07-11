import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { defaultProtectionProfile } from '../data/healthProfile'
import {
  archivedNotifications,
  educationContents,
  initialDocuments,
  initialFamilyEvents,
  initialHistoryTodos,
  initialMembers,
  initialTodos,
} from '../data/mockData'
import {
  deriveNotifications,
  deriveSystemTodos,
  mergeTodos,
  resolveTodoCompletion,
} from '../services/rulesEngine'
import { computeCoverageSummary } from '../utils/calculations'
import type {
  AppTab,
  ChatMessage,
  FamilyEvent,
  FamilyMember,
  MemberNavigationTarget,
  ProtectionLifeProfile,
  NewEventInput,
  NewMemberInput,
  NewPolicyInput,
  Policy,
  AppNotification,
  SecureDocument,
  TodoItem,
  UiState,
  UpdateMemberProfileInput,
  UpdateTodoInput,
} from '../types'

function unionPoliciesForMember(member: FamilyMember) {
  return member.policies.filter((policy) => policy.source === 'union')
}

const initialUnionPolicyBackups = Object.fromEntries(
  initialMembers
    .map((member) => [member.id, unionPoliciesForMember(member)] as const)
    .filter(([, policies]) => policies.length > 0),
)

interface AppContextValue {
  hasFamily: boolean
  setupFamily: () => void
  currentTab: AppTab
  setCurrentTab: (tab: AppTab) => void
  navigateToMember: (
    memberId: string,
    target?: Pick<MemberNavigationTarget, 'policyId' | 'gapKey'>,
  ) => void
  clearMemberNavigationTarget: () => void
  memberNavigationTarget: MemberNavigationTarget | null
  isProfileView: boolean
  navigateToProfile: () => void
  closeProfileView: () => void
  members: FamilyMember[]
  memberCount: number
  todos: TodoItem[]
  systemTodos: TodoItem[]
  persistedTodos: TodoItem[]
  dismissedRuleIds: ReadonlySet<string>
  historyTodos: TodoItem[]
  notifications: AppNotification[]
  familyEvents: FamilyEvent[]
  documents: SecureDocument[]
  education: typeof educationContents
  coverage: ReturnType<typeof computeCoverageSummary>
  protectionProfile: ProtectionLifeProfile
  updateProtectionProfile: (profile: ProtectionLifeProfile) => void
  uiState: UiState
  setUiState: (state: UiState) => void
  completeTodo: (id: string) => void
  completeFamilyEvent: (eventId: string) => void
  addFamilyEvent: (event: NewEventInput) => void
  updateFamilyEvent: (eventId: string, input: NewEventInput) => void
  updateTodo: (id: string, input: UpdateTodoInput) => void
  addMember: (member: NewMemberInput) => void
  updateMemberProfile: (memberId: string, input: UpdateMemberProfileInput) => void
  addManualPolicy: (memberId: string, input: NewPolicyInput) => void
  unionSyncEnabled: boolean
  unionPolicyCount: number
  setUnionSyncEnabled: (enabled: boolean) => void
  markNotificationRead: (id: string) => void
  selectedMemberId: string | null
  setSelectedMemberId: (id: string | null) => void
  chatMessages: ChatMessage[]
  addChatMessage: (content: string, role: 'user' | 'assistant') => void
  simulateLoading: (duration?: number) => Promise<void>
  currentUserId: string
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasFamily, setHasFamily] = useState(true)
  const [currentTab, setCurrentTabState] = useState<AppTab>('overview')
  const [isProfileView, setIsProfileView] = useState(false)

  const currentUserId = 'm1'

  const [members, setMembers] = useState<FamilyMember[]>(initialMembers)
  const [unionSyncByMember, setUnionSyncByMember] = useState<Record<string, boolean>>({
    [currentUserId]: true,
  })
  const [unionPolicyBackups, setUnionPolicyBackups] = useState<Record<string, Policy[]>>(
    initialUnionPolicyBackups,
  )
  const [persistedTodos, setPersistedTodos] = useState<TodoItem[]>(initialTodos)
  const [historyTodos, setHistoryTodos] = useState<TodoItem[]>(initialHistoryTodos)
  const [dismissedRuleIds, setDismissedRuleIds] = useState<Set<string>>(new Set())
  const [notificationReadIds, setNotificationReadIds] = useState<Set<string>>(
    () => new Set(archivedNotifications.filter((item) => item.read).map((item) => item.id)),
  )
  const [familyEvents, setFamilyEvents] = useState<FamilyEvent[]>(initialFamilyEvents)
  const [documents] = useState<SecureDocument[]>(initialDocuments)
  const [protectionProfile, setProtectionProfile] =
    useState<ProtectionLifeProfile>(defaultProtectionProfile)
  const [uiState, setUiState] = useState<UiState>('idle')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [memberNavigationTarget, setMemberNavigationTarget] =
    useState<MemberNavigationTarget | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const memberCount = members.length
  const unionSyncEnabled = unionSyncByMember[currentUserId] ?? true
  const unionPolicyCount = unionPolicyBackups[currentUserId]?.length ?? 0
  const coverage = useMemo(
    () => computeCoverageSummary(members, protectionProfile),
    [members, protectionProfile],
  )

  const systemTodos = useMemo(
    () => deriveSystemTodos(members, protectionProfile, dismissedRuleIds),
    [members, protectionProfile, dismissedRuleIds],
  )

  const todos = useMemo(
    () => mergeTodos(systemTodos, persistedTodos),
    [systemTodos, persistedTodos],
  )

  const notifications = useMemo(() => {
    const live = deriveNotifications(members)
    const merged = [...live, ...archivedNotifications]
    return merged.map((item) => ({
      ...item,
      read: notificationReadIds.has(item.id),
    }))
  }, [members, notificationReadIds])

  const engineStateRef = useRef({
    persistedTodos,
    members,
    protectionProfile,
    dismissedRuleIds,
    todos,
  })
  engineStateRef.current = {
    persistedTodos,
    members,
    protectionProfile,
    dismissedRuleIds,
    todos,
  }

  const setCurrentTab = useCallback((tab: AppTab) => {
    setIsProfileView(false)
    setCurrentTabState(tab)
  }, [])

  const navigateToMember = useCallback(
    (memberId: string, target?: Pick<MemberNavigationTarget, 'policyId' | 'gapKey'>) => {
      setIsProfileView(false)
      setSelectedMemberId(memberId)
      setMemberNavigationTarget(
        target ? { memberId, ...target } : { memberId },
      )
      setCurrentTabState('protection')
    },
    [],
  )

  const clearMemberNavigationTarget = useCallback(() => {
    setMemberNavigationTarget(null)
  }, [])

  const navigateToProfile = useCallback(() => {
    setIsProfileView(true)
    setSelectedMemberId(null)
  }, [])

  const closeProfileView = useCallback(() => {
    setIsProfileView(false)
  }, [])

  const setupFamily = useCallback(() => {
    setHasFamily(true)
    setUiState('success')
    setTimeout(() => setUiState('idle'), 2500)
  }, [])

  const updateProtectionProfile = useCallback((profile: ProtectionLifeProfile) => {
    setProtectionProfile(profile)
    setUiState('success')
    setTimeout(() => setUiState('idle'), 2000)
  }, [])

  const completeTodo = useCallback((id: string) => {
    const {
      persistedTodos: currentPersisted,
      members: currentMembers,
      protectionProfile: currentProfile,
      dismissedRuleIds: currentDismissed,
    } = engineStateRef.current

    const result = resolveTodoCompletion(
      id,
      currentPersisted,
      currentMembers,
      currentProfile,
      currentDismissed,
    )
    if (!result?.completed) return

    const completed: TodoItem = {
      ...result.completed,
      completed: true,
      completedAt: new Date().toISOString().split('T')[0],
    }

    setPersistedTodos(result.persistedTodos)
    setMembers(result.members)
    setDismissedRuleIds(result.dismissedRuleIds)
    setHistoryTodos((history) => [completed, ...history])

    if (completed.eventId) {
      setFamilyEvents((events) => events.filter((event) => event.id !== completed.eventId))
    }

    setUiState('success')
    setTimeout(() => setUiState('idle'), 2000)
  }, [])

  const completeFamilyEvent = useCallback(
    (eventId: string) => {
      const linkedTodo = engineStateRef.current.todos.find((todo) => todo.eventId === eventId)
      if (linkedTodo) {
        completeTodo(linkedTodo.id)
        return
      }

      const event = familyEvents.find((item) => item.id === eventId)
      if (!event) return

      const memberId = event.memberIds[0] ?? currentUserId
      const memberName = members.find((member) => member.id === memberId)?.name ?? '家庭'
      const completed: TodoItem = {
        id: `hist-${eventId}-${Date.now()}`,
        title: event.name,
        memberId,
        memberName,
        urgency: event.urgency,
        dueDate: event.date,
        completed: true,
        completedAt: new Date().toISOString().split('T')[0],
        source: 'event',
        eventId: event.id,
      }

      setHistoryTodos((history) => [completed, ...history])
      setFamilyEvents((events) => events.filter((item) => item.id !== eventId))
      setUiState('success')
      setTimeout(() => setUiState('idle'), 2000)
    },
    [completeTodo, currentUserId, familyEvents, members],
  )

  const updateFamilyEvent = useCallback(
    (eventId: string, input: NewEventInput) => {
      setFamilyEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                name: input.name,
                type: input.type,
                date: input.date,
                frequency: input.frequency,
                fundsNeeded: input.fundsNeeded,
                urgency: input.urgency,
                description: input.description,
                memberIds: input.memberIds,
              }
            : event,
        ),
      )

      setPersistedTodos((prev) =>
        prev.map((todo) => {
          if (todo.eventId !== eventId) return todo
          const memberId = input.memberIds[0] ?? todo.memberId
          const memberName = members.find((member) => member.id === memberId)?.name ?? todo.memberName
          return {
            ...todo,
            title: input.name,
            memberId,
            memberName,
            urgency: input.urgency,
            dueDate: input.date,
          }
        }),
      )
      setUiState('success')
      setTimeout(() => setUiState('idle'), 2000)
    },
    [members],
  )

  const updateTodo = useCallback((id: string, input: UpdateTodoInput) => {
    setPersistedTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title: input.title,
              dueDate: input.dueDate,
              urgency: input.urgency,
            }
          : todo,
      ),
    )
    setUiState('success')
    setTimeout(() => setUiState('idle'), 2000)
  }, [])

  const addFamilyEvent = useCallback((input: NewEventInput) => {
    const event: FamilyEvent = {
      id: `fe${Date.now()}`,
      ...input,
      createdBy: members.find((m) => m.id === currentUserId)?.name ?? '王建國',
    }
    setFamilyEvents((prev) => [...prev, event])

    const todo: TodoItem = {
      id: `t${Date.now()}`,
      title: input.name,
      memberId: input.memberIds[0] ?? currentUserId,
      memberName: members.find((m) => m.id === input.memberIds[0])?.name ?? '家庭',
      urgency: input.urgency,
      dueDate: input.date,
      completed: false,
      source: 'event',
      eventId: event.id,
    }
    setPersistedTodos((prev) => [...prev, todo])
    setUiState('success')
    setTimeout(() => setUiState('idle'), 2000)
  }, [members, currentUserId])

  const updateMemberProfile = useCallback(
    (memberId: string, input: UpdateMemberProfileInput) => {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === memberId
            ? {
                ...member,
                name: input.name,
                age: input.age,
                occupation: input.occupation,
                phone: input.phone,
                email: input.email,
                monthlyIncome: input.monthlyIncome,
                monthlyExpense: input.monthlyExpense,
              }
            : member,
        ),
      )
      setPersistedTodos((prev) =>
        prev.map((todo) =>
          todo.memberId === memberId ? { ...todo, memberName: input.name } : todo,
        ),
      )
      setUiState('success')
      setTimeout(() => setUiState('idle'), 2000)
    },
    [],
  )

  const setUnionSyncEnabled = useCallback(
    (enabled: boolean) => {
      const memberId = currentUserId
      setUnionSyncByMember((prev) => ({ ...prev, [memberId]: enabled }))

      if (!enabled) {
        setMembers((prev) =>
          prev.map((member) => {
            if (member.id !== memberId) return member
            const unionPolicies = unionPoliciesForMember(member)
            if (unionPolicies.length > 0) {
              setUnionPolicyBackups((backups) => ({ ...backups, [memberId]: unionPolicies }))
            }
            return {
              ...member,
              policies: member.policies.filter((policy) => policy.source !== 'union'),
            }
          }),
        )
      } else {
        setUnionPolicyBackups((backups) => {
          const backup = backups[memberId] ?? []
          setMembers((prev) =>
            prev.map((member) => {
              if (member.id !== memberId) return member
              const manualPolicies = member.policies.filter((policy) => policy.source === 'manual')
              const mergedUnion = backup.filter(
                (policy) => !manualPolicies.some((manual) => manual.id === policy.id),
              )
              return { ...member, policies: [...mergedUnion, ...manualPolicies] }
            }),
          )
          return backups
        })
      }

      setUiState('success')
      setTimeout(() => setUiState('idle'), 2000)
    },
    [currentUserId],
  )

  const addMember = useCallback((input: NewMemberInput) => {
    const colors = ['#2d7a70', '#3d9b8f', '#1f5f57', '#6b8cae', '#4a8f85']
    const member: FamilyMember = {
      id: `m${Date.now()}`,
      name: input.name,
      age: input.age,
      role: input.role,
      lifeStage: input.age >= 65 ? 'retired' : input.age >= 40 ? 'midcareer' : 'married',
      avatarColor: colors[members.length % colors.length],
      avatarSeed: input.name,
      phone: input.phone,
      email: input.email,
      occupation: input.occupation,
      monthlyIncome: 0,
      monthlyExpense: 0,
      policies: [],
    }
    setMembers((prev) => [...prev, member])
    setUiState('success')
    setTimeout(() => setUiState('idle'), 2000)
  }, [members.length])

  const addManualPolicy = useCallback((memberId: string, input: NewPolicyInput) => {
    const policy: Policy = {
      id: `p${Date.now()}`,
      name: input.name,
      insurer: input.insurer,
      type: input.type,
      coverage: input.coverage ?? 0,
      monthlyPayout: 0,
      eventPayout: input.coverage ?? 0,
      premium: 0,
      beneficiary: input.beneficiary?.trim() || '本人',
      expiryDate: input.expiryDate?.trim() || '未填寫',
      status: 'active',
      source: 'manual',
    }
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId ? { ...m, policies: [...m.policies, policy] } : m,
      ),
    )
    setUiState('success')
    setTimeout(() => setUiState('idle'), 2000)
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotificationReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const addChatMessage = useCallback((content: string, role: 'user' | 'assistant') => {
    setChatMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, role, content, timestamp: new Date() },
    ])
  }, [])

  const simulateLoading = useCallback(async (duration = 1500) => {
    setUiState('loading')
    await new Promise((resolve) => setTimeout(resolve, duration))
    setUiState('idle')
  }, [])

  const value = useMemo(
    () => ({
      hasFamily,
      setupFamily,
      currentTab,
      setCurrentTab,
      navigateToMember,
      clearMemberNavigationTarget,
      memberNavigationTarget,
      isProfileView,
      navigateToProfile,
      closeProfileView,
      members,
      memberCount,
      todos,
      systemTodos,
      persistedTodos,
      dismissedRuleIds,
      historyTodos,
      notifications,
      familyEvents,
      documents,
      education: educationContents,
      coverage,
      protectionProfile,
      updateProtectionProfile,
      uiState,
      setUiState,
      completeTodo,
      completeFamilyEvent,
      addFamilyEvent,
      updateFamilyEvent,
      updateTodo,
      addMember,
      updateMemberProfile,
      addManualPolicy,
      unionSyncEnabled,
      unionPolicyCount,
      setUnionSyncEnabled,
      markNotificationRead,
      selectedMemberId,
      setSelectedMemberId,
      chatMessages,
      addChatMessage,
      simulateLoading,
      currentUserId,
    }),
    [
      hasFamily,
      setupFamily,
      currentTab,
      setCurrentTab,
      navigateToMember,
      clearMemberNavigationTarget,
      memberNavigationTarget,
      isProfileView,
      navigateToProfile,
      closeProfileView,
      members,
      memberCount,
      todos,
      systemTodos,
      persistedTodos,
      dismissedRuleIds,
      historyTodos,
      notifications,
      familyEvents,
      documents,
      coverage,
      protectionProfile,
      updateProtectionProfile,
      uiState,
      completeTodo,
      completeFamilyEvent,
      addFamilyEvent,
      updateFamilyEvent,
      updateTodo,
      addMember,
      updateMemberProfile,
      unionSyncEnabled,
      unionPolicyCount,
      setUnionSyncEnabled,
      addManualPolicy,
      markNotificationRead,
      selectedMemberId,
      chatMessages,
      addChatMessage,
      simulateLoading,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}