export type AppTab = 'overview' | 'claims' | 'advisor' | 'protection'

export type ClaimStatus =
  | 'in_review'
  | 'pending_docs'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'renewal'

export interface ClaimRecord {
  id: string
  policyId: string
  memberId: string
  memberName: string
  avatarSeed: string
  policyName: string
  insurer: string
  eventLabel: string
  eventType: string
  claimStatus: ClaimStatus
  progress: number
  statusLabel: string
  statusSummary: string
  updatedAt: string
  amount?: number
  isError: boolean
}

export type ProtectionTier = 1 | 2 | 3 | 4 | 5

export interface ProtectionLifeProfile {
  tier: ProtectionTier
  tierLabel: string
  tierDescription: string
  targets: {
    deathCoverage: number
    medicalCoverage: number
    longtermMonthly: number
    disabilityMonthly: number
    criticalCoverage: number
  }
  completedAt: string
  answers: Record<string, string>
}

export type LifeStage = 'single' | 'married' | 'parent' | 'midcareer' | 'pre-retirement' | 'retired'

export type MemberRole = 'owner' | 'spouse' | 'child' | 'parent' | 'viewer'

export type EventType =
  | 'marriage'
  | 'birth'
  | 'home'
  | 'retirement'
  | 'disability'
  | 'longterm-care'
  | 'medical'
  | 'education'
  | 'other'

export type ScenarioEventType = 'disability' | 'longterm-care' | 'death' | 'accident' | 'retirement'

export type UiState = 'idle' | 'loading' | 'error' | 'success' | 'empty'

export type TodoUrgency = 'high' | 'medium' | 'low'

export type EventFrequency = 'once' | 'monthly' | 'yearly'

export type NotificationType =
  | 'policy-update'
  | 'policy-expiry'
  | 'policy-purchase'
  | 'claim-progress'

export interface FamilyMember {
  id: string
  name: string
  age: number
  role: MemberRole
  lifeStage: LifeStage
  avatarColor: string
  avatarSeed: string
  phone: string
  email: string
  occupation: string
  monthlyIncome: number
  monthlyExpense: number
  policies: Policy[]
}

export type PolicySource = 'union' | 'manual'

export interface Policy {
  id: string
  name: string
  insurer: string
  type: 'life' | 'health' | 'accident' | 'longterm' | 'savings' | 'disability' | 'critical'
  coverage: number
  monthlyPayout: number
  eventPayout: number
  premium: number
  beneficiary: string
  expiryDate: string
  status: 'active' | 'expiring' | 'expired' | 'pending'
  source: PolicySource
}

export interface AccidentPayoutItem {
  id: string
  memberName: string
  insurer: string
  policyName: string
  eventType: string
  eventLabel: string
  amount: number
}

export interface AccidentPayoutGroup {
  eventType: string
  eventLabel: string
  totalAmount: number
  memberNames: string[]
  items: AccidentPayoutItem[]
}

export interface NonAccidentCoverageItem {
  id: string
  memberName: string
  insurer: string
  policyName: string
  categoryType: string
  categoryLabel: string
  amount: number
  isMonthly: boolean
}

export interface NonAccidentCoverageGroup {
  categoryType: string
  categoryLabel: string
  totalAmount: number
  isMonthly: boolean
  memberNames: string[]
  items: NonAccidentCoverageItem[]
}

export type FamilyCoverageDomain = 'life' | 'medical'

export interface FamilyCoveragePolicyItem {
  id: string
  memberId: string
  memberName: string
  insurer: string
  policyName: string
  subcategoryType: string
  subcategoryLabel: string
  amount: number
  isMonthly: boolean
}

export interface FamilyCoverageSubcategory {
  subcategoryType: string
  subcategoryLabel: string
  totalAmount: number
  isMonthly: boolean
  memberNames: string[]
  items: FamilyCoveragePolicyItem[]
}

export interface FamilyCoverageDomainSummary {
  domain: FamilyCoverageDomain
  label: string
  description: string
  headlineAmount: number
  headlineUnit: string
  policyCount: number
  memberCount: number
  memberNames: string[]
  activeClaimCount: number
  subcategories: FamilyCoverageSubcategory[]
}

export interface CoverageSummary {
  healthScore: number
  healthTierLabel: string
  fixedCoverage: number
  accidentPayouts: AccidentPayoutItem[]
  gaps: CoverageGap[]
}

export interface AdvisorRecommendation {
  name: string
  title: string
  phone: string
  reason: string
}

export interface PolicyWithMember {
  policy: Policy
  memberId: string
  memberName: string
  avatarSeed: string
}

export interface PolicyCategoryGroup {
  category: string
  gapKey: CoverageGap['gapKey'] | 'other'
  policies: PolicyWithMember[]
}

export interface GapLapsedMember {
  memberId: string
  memberName: string
  policyId: string
}

export interface CoverageGap {
  category: string
  gapKey: 'death' | 'medical' | 'longterm' | 'disability' | 'critical'
  current: number
  recommended: number
  unit: string
  coveredMembers: string[]
  /** 曾有此類保障、但保單已失效的成員（可點擊查看保單詳情） */
  lapsedMembers: GapLapsedMember[]
}

export interface TodoItem {
  id: string
  title: string
  memberId: string
  memberName: string
  policyId?: string
  /** 規則引擎穩定識別碼，例如 renewal:p2、gap:critical */
  ruleId?: string
  urgency: TodoUrgency
  dueDate?: string
  completed: boolean
  completedAt?: string
  source: 'manual' | 'event' | 'system'
  eventId?: string
}

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  date: string
  read: boolean
  memberId?: string
}

export interface FamilyEvent {
  id: string
  name: string
  type?: EventType
  date?: string
  frequency: EventFrequency
  fundsNeeded: number
  urgency: TodoUrgency
  description?: string
  memberIds: string[]
  createdBy: string
}

export interface EducationContent {
  id: string
  title: string
  stage: string
  type: 'article' | 'video' | 'quiz'
  duration: string
}

export interface SecureDocument {
  id: string
  name: string
  type: 'will' | 'trust' | 'medical' | 'contract' | 'policy'
  ownerMemberId: string
  uploadedBy: string
  uploadedAt: string
  encrypted: boolean
  emergencyAccess: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ScenarioInput {
  memberId: string
  event: ScenarioEventType
  age: number
}

export interface ProductRecommendation {
  name: string
  type: string
  reason: string
  estimatedPremium: number
  /** 此商品預估可補足的保障（與缺口同單位） */
  estimatedBoostLabel?: string
}

/** 缺口試算說明 — 總覽與情境模擬共用同一套呈現 */
export interface GapBreakdownDisplay {
  category: string
  formula: string
  profileNote: string
  isMonthly: boolean
  rows: {
    label: string
    value: string
    tone?: 'need' | 'current' | 'gap' | 'target'
  }[]
}

export interface ScenarioResult {
  breakdown: GapBreakdownDisplay
  gapAmount: number
  affectedMembers: string[]
  recommendations: ProductRecommendation[]
  recommendedAdvisor: AdvisorRecommendation
  narrative: string
}

export interface NewMemberInput {
  name: string
  age: number
  role: MemberRole
  phone: string
  email: string
  occupation: string
}

export interface UpdateMemberProfileInput {
  name: string
  age: number
  occupation: string
  phone: string
  email: string
  monthlyIncome: number
  monthlyExpense: number
}

export interface UpdateTodoInput {
  title: string
  dueDate?: string
  urgency: TodoUrgency
}

export interface NewEventInput {
  name: string
  type?: EventType
  date?: string
  frequency: EventFrequency
  fundsNeeded: number
  urgency: TodoUrgency
  description?: string
  memberIds: string[]
}

export interface NewPolicyInput {
  name: string
  insurer: string
  type: Policy['type']
  beneficiary?: string
  expiryDate?: string
  coverage?: number
}