import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { defaultProtectionProfile } from '../data/healthProfile'
import {
  educationContents,
  initialDocuments,
  initialFamilyEvents,
  initialHistoryTodos,
  initialMembers,
  initialNotifications,
  initialTodos,
} from '../data/mockData'
import { computeCoverageSummary } from '../utils/calculations'
import type {
  AppTab,
  ReminderSubTab,
  ChatMessage,
  FamilyEvent,
  FamilyMember,
  ProtectionLifeProfile,
  NewEventInput,
  NewMemberInput,
  NewPolicyInput,
  Policy,
  AppNotification,
  SecureDocument,
  TodoItem,
  UiState,
} from '../types'

interface AppContextValue {
  hasFamily: boolean
  setupFamily: () => void
  currentTab: AppTab
  setCurrentTab: (tab: AppTab) => void
  reminderSubTab: ReminderSubTab
  setReminderSubTab: (tab: ReminderSubTab) => void
  navigateToReminders: (subTab?: ReminderSubTab) => void
  isProfileView: boolean
  navigateToProfile: () => void
  closeProfileView: () => void
  members: FamilyMember[]
  memberCount: number
  todos: TodoItem[]
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
  addFamilyEvent: (event: NewEventInput) => void
  addMember: (member: NewMemberInput) => void
  addManualPolicy: (memberId: string, input: NewPolicyInput) => void
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
  const [reminderSubTab, setReminderSubTab] = useState<ReminderSubTab>('notifications')
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers)
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos)
  const [historyTodos, setHistoryTodos] = useState<TodoItem[]>(initialHistoryTodos)
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications)
  const [familyEvents, setFamilyEvents] = useState<FamilyEvent[]>(initialFamilyEvents)
  const [documents] = useState<SecureDocument[]>(initialDocuments)
  const [protectionProfile, setProtectionProfile] =
    useState<ProtectionLifeProfile>(defaultProtectionProfile)
  const [uiState, setUiState] = useState<UiState>('idle')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '您好！我是護家神山 AI 保障顧問。我可以根據您家庭的保單與人生規劃，提供個人化的保障建議。您也可以使用情境模擬選單快速分析。',
      timestamp: new Date(),
    },
  ])

  const currentUserId = 'm1'
  const memberCount = members.length
  const coverage = useMemo(
    () => computeCoverageSummary(members, protectionProfile),
    [members, protectionProfile],
  )

  const setCurrentTab = useCallback((tab: AppTab) => {
    setIsProfileView(false)
    setCurrentTabState(tab)
  }, [])

  const navigateToReminders = useCallback((subTab: ReminderSubTab = 'notifications') => {
    setIsProfileView(false)
    setReminderSubTab(subTab)
    setCurrentTabState('reminders')
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
    setTodos((prev) => {
      const item = prev.find((t) => t.id === id)
      if (!item) return prev
      const completed: TodoItem = {
        ...item,
        completed: true,
        completedAt: new Date().toISOString().split('T')[0],
      }
      setHistoryTodos((h) => [completed, ...h])
      return prev.filter((t) => t.id !== id)
    })
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
    setTodos((prev) => [...prev, todo])
    setUiState('success')
    setTimeout(() => setUiState('idle'), 2000)
  }, [members, currentUserId])

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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
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
      reminderSubTab,
      setReminderSubTab,
      navigateToReminders,
      isProfileView,
      navigateToProfile,
      closeProfileView,
      members,
      memberCount,
      todos,
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
      addFamilyEvent,
      addMember,
      addManualPolicy,
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
      reminderSubTab,
      navigateToReminders,
      isProfileView,
      navigateToProfile,
      closeProfileView,
      members,
      memberCount,
      todos,
      historyTodos,
      notifications,
      familyEvents,
      documents,
      coverage,
      protectionProfile,
      updateProtectionProfile,
      uiState,
      completeTodo,
      addFamilyEvent,
      addMember,
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