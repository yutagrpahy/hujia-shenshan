import {
  Bot,
  FileCheck2,
  LayoutDashboard,
  Shield,
} from 'lucide-react'
import { useMemo } from 'react'
import { buildFamilyClaims } from '../../data/claims'
import { useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { useCollapsingHeader } from '../../hooks/useCollapsingHeader'
import { useElementHeight } from '../../hooks/useElementHeight'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { getMemberAvatarUrl } from '../../utils/avatars'
import { BrandHeader } from '../common/BrandHeader'
import { BrandLogo } from '../common/BrandLogo'
import { UserHeaderMeta } from '../common/UserHeaderMeta'
import type { AppTab, FamilyMember } from '../../types'

const TABS: { id: AppTab; label: string; icon: typeof LayoutDashboard; desc: string }[] = [
  { id: 'overview', label: '總覽', icon: LayoutDashboard, desc: '家庭保障全貌' },
  { id: 'claims', label: '理賠', icon: FileCheck2, desc: '出險進度' },
  { id: 'advisor', label: 'AI 顧問', icon: Bot, desc: '對話與模擬' },
  { id: 'protection', label: '保障', icon: Shield, desc: '成員與事件' },
]

const TAB_TITLES: Record<AppTab, string> = {
  overview: '總覽',
  claims: '理賠',
  advisor: 'AI 保障顧問',
  protection: '保障',
}

function SkipToMainLink() {
  return (
    <a href="#main-content" className="skip-link">
      跳至主要內容
    </a>
  )
}

interface AppShellProps {
  children: React.ReactNode
}

/** 固定頂部列下方與內容之間的額外留白（px） */
const MOBILE_HEADER_CONTENT_GAP = 12

function MobileShell({
  scrollResetKey,
  pageTitle,
  hidePageTitle,
  currentUser,
  memberCount,
  avatarButton,
  navItems,
  children,
}: {
  scrollResetKey: string
  pageTitle: string
  hidePageTitle: boolean
  currentUser: FamilyMember | undefined
  memberCount: number
  avatarButton: React.ReactNode
  navItems: React.ReactNode
  children: React.ReactNode
}) {
  const scrollRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const headerVisible = useCollapsingHeader(scrollRef, 1000, scrollResetKey)
  const headerHeight = useElementHeight(headerRef, [headerVisible])

  useEffect(() => {
    const root = scrollRef.current?.closest('.app-layout--mobile') as HTMLElement | null
    if (root && headerHeight > 0) {
      root.style.setProperty('--mobile-header-height', `${headerHeight}px`)
      root.style.setProperty(
        '--mobile-content-top',
        `${headerHeight + MOBILE_HEADER_CONTENT_GAP}px`,
      )
    }
  }, [headerHeight])

  return (
    <div className="app-layout app-layout--mobile min-h-dvh flex flex-col">
      <SkipToMainLink />
      <header
        ref={headerRef}
        className={`m3-app-bar m3-app-bar--mobile-fixed warm-header w-full max-w-full min-w-0 ${
          headerVisible ? '' : 'm3-app-bar--hidden'
        }`}
      >
        <div className="flex items-center justify-between gap-2 min-w-0 w-full">
          <div className="brand-header-cluster min-w-0 flex-1">
            <BrandLogo size={44} />
            <BrandHeader variant="mobile" />
          </div>
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            {currentUser && (
              <UserHeaderMeta user={currentUser} memberCount={memberCount} compact />
            )}
            {avatarButton}
          </div>
        </div>
      </header>

      <main
        id="main-content"
        ref={scrollRef}
        tabIndex={-1}
        className="main-content main-content--mobile main-content--mobile-scroll flex-1 min-h-0 min-w-0 w-full"
      >
        <div className="content-container content-container--wide min-w-0 w-full">
          {!hidePageTitle ? <h1 className="sr-only">{pageTitle}</h1> : null}
          {children}
        </div>
      </main>

      <nav className="m3-bottom-nav" aria-label="主要導覽">
        {navItems}
      </nav>
    </div>
  )
}

export function AppShell({ children }: AppShellProps) {
  const {
    currentTab,
    setCurrentTab,
    isProfileView,
    currentUserId,
    members,
    memberCount,
    navigateToProfile,
    selectedMemberId,
  } = useApp()
  const pageTitle = isProfileView ? '個人資料' : TAB_TITLES[currentTab]
  const hidePageTitle = currentTab === 'protection' && selectedMemberId !== null
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const claimActionCount = useMemo(
    () => buildFamilyClaims(members).filter((claim) => claim.isError).length,
    [members],
  )
  const currentUser = members.find((m) => m.id === currentUserId)

  const navItems = TABS.map(({ id, label, icon: Icon, desc }) => {
    const isActive = currentTab === id
    const showBadge = id === 'claims' && claimActionCount > 0
    return (
      <button
        key={id}
        type="button"
        onClick={() => setCurrentTab(id)}
        className={isMobile ? `m3-nav-item ${isActive ? 'active' : ''}` : `top-nav-pill ${isActive ? 'active' : ''}`}
        title={desc}
        aria-label={`${label}：${desc}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {isMobile ? (
          <>
            <div className="m3-nav-indicator relative">
              <Icon className="w-5 h-5" />
              {showBadge && (
                <span className="nav-badge">{claimActionCount}</span>
              )}
            </div>
            <span>{label}</span>
          </>
        ) : (
          <>
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {showBadge && (
              <span className="nav-badge nav-badge--inline">{claimActionCount}</span>
            )}
          </>
        )}
      </button>
    )
  })

  const avatarButton = currentUser ? (
    <button
      onClick={navigateToProfile}
      className="avatar-btn shrink-0"
      aria-label={`前往 ${currentUser.name} 的個人資料`}
      title="個人資料"
    >
      <img
        src={getMemberAvatarUrl(currentUser.avatarSeed, 0)}
        alt={currentUser.name}
        className={`member-avatar member-avatar--default ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}
      />
    </button>
  ) : null

  if (isMobile) {
    return (
      <MobileShell
        scrollResetKey={`${currentTab}-${isProfileView}`}
        pageTitle={pageTitle}
        hidePageTitle={hidePageTitle}
        currentUser={currentUser}
        memberCount={memberCount}
        avatarButton={avatarButton}
        navItems={navItems}
      >
        {children}
      </MobileShell>
    )
  }

  return (
    <div className="app-layout app-layout--desktop min-h-dvh">
      <SkipToMainLink />
      <header className="desktop-top-nav warm-header">
        <div className="desktop-nav-inner">
          <div className="brand-header-cluster shrink-0">
            <BrandLogo size={52} />
            <BrandHeader variant="desktop" />
          </div>

          <nav className="top-nav-pills" aria-label="主要導覽">
            {navItems}
          </nav>

          <div className="flex items-center gap-3 shrink-0 min-w-0">
            {currentUser && (
              <UserHeaderMeta user={currentUser} memberCount={memberCount} />
            )}
            {avatarButton}
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="main-content main-content--desktop">
        <div className="content-container content-container--wide">
          {!hidePageTitle && <h1 className="page-title">{pageTitle}</h1>}
          {children}
        </div>
      </main>
    </div>
  )
}