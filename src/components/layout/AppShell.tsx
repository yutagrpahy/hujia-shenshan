import {
  Bell,
  Bot,
  LayoutDashboard,
  Shield,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { getMemberAvatarUrl } from '../../utils/avatars'
import { BrandHeader } from '../common/BrandHeader'
import { BrandLogo } from '../common/BrandLogo'
import type { AppTab } from '../../types'

const TABS: { id: AppTab; label: string; icon: typeof LayoutDashboard; desc: string }[] = [
  { id: 'overview', label: '總覽', icon: LayoutDashboard, desc: '家庭保障全貌' },
  { id: 'reminders', label: '提醒', icon: Bell, desc: '待辦與通知' },
  { id: 'advisor', label: 'AI 顧問', icon: Bot, desc: '對話與模擬' },
  { id: 'protection', label: '保障', icon: Shield, desc: '成員與事件' },
]

const TAB_TITLES: Record<AppTab, string> = {
  overview: '總覽',
  reminders: '提醒',
  advisor: 'AI 保障顧問',
  protection: '保障',
}

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const {
    currentTab,
    setCurrentTab,
    isProfileView,
    notifications,
    currentUserId,
    members,
    memberCount,
    navigateToProfile,
  } = useApp()
  const pageTitle = isProfileView ? '個人資料' : TAB_TITLES[currentTab]
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const unreadNotifs = notifications.filter((n) => !n.read).length
  const currentUser = members.find((m) => m.id === currentUserId)

  const navItems = TABS.map(({ id, label, icon: Icon, desc }) => {
    const isActive = currentTab === id
    const showBadge = id === 'reminders' && unreadNotifs > 0
    return (
      <button
        key={id}
        onClick={() => setCurrentTab(id)}
        className={isMobile ? `m3-nav-item ${isActive ? 'active' : ''}` : `top-nav-pill ${isActive ? 'active' : ''}`}
        title={desc}
      >
        {isMobile ? (
          <>
            <div className="m3-nav-indicator relative">
              <Icon className="w-5 h-5" />
              {showBadge && (
                <span className="nav-badge">{unreadNotifs}</span>
              )}
            </div>
            <span>{label}</span>
          </>
        ) : (
          <>
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {showBadge && <span className="nav-badge nav-badge--inline">{unreadNotifs}</span>}
          </>
        )}
      </button>
    )
  })

  const avatarButton = currentUser ? (
    <button
      onClick={navigateToProfile}
      className="avatar-btn"
      aria-label={`前往 ${currentUser.name} 的個人資料`}
      title="個人資料"
    >
      <img
        src={getMemberAvatarUrl(currentUser.avatarSeed, 0)}
        alt={currentUser.name}
        className={isMobile ? 'w-8 h-8 rounded-full ring-2 ring-white shadow-sm' : 'w-10 h-10 rounded-2xl ring-2 ring-white shadow-sm'}
      />
    </button>
  ) : null

  if (isMobile) {
    return (
      <div className="app-layout app-layout--mobile min-h-dvh flex flex-col">
        <header className="m3-app-bar warm-header w-full max-w-full min-w-0">
          <div className="flex items-center justify-between gap-2 min-w-0 w-full">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <BrandLogo size={40} className="shrink-0 shadow-sm" />
              <BrandHeader memberCount={memberCount} variant="mobile" />
            </div>
            <div className="shrink-0">{avatarButton}</div>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mt-3 truncate">{pageTitle}</h2>
        </header>

        <main className="main-content main-content--mobile flex-1 relative min-w-0 w-full">
          <div className="content-container content-container--wide min-w-0 w-full">
            {children}
          </div>
        </main>

        <nav className="m3-bottom-nav">{navItems}</nav>
      </div>
    )
  }

  return (
    <div className="app-layout app-layout--desktop min-h-dvh">
      <header className="desktop-top-nav warm-header">
        <div className="desktop-nav-inner">
          <div className="flex items-center gap-3 shrink-0">
            <BrandLogo size={44} className="shrink-0 shadow-sm" />
            <BrandHeader memberCount={memberCount} variant="desktop" />
          </div>

          <nav className="top-nav-pills">{navItems}</nav>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser && (
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                <span className="text-[10px] text-gray-400">家庭管理者</span>
              </div>
            )}
            {avatarButton}
          </div>
        </div>
      </header>

      <main className="main-content main-content--desktop">
        <div className="content-container content-container--wide">
          <h2 className="page-title">{pageTitle}</h2>
          {children}
        </div>
      </main>
    </div>
  )
}