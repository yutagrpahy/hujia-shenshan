import { AppProvider, useApp } from './context/AppContext'
import { AppShell } from './components/layout/AppShell'
import { OverviewPage } from './components/overview/OverviewPage'
import { RemindersPage } from './components/reminders/RemindersPage'
import { AdvisorPage } from './components/advisor/AdvisorPage'
import { ProtectionPage } from './components/protection/ProtectionPage'
import { ProfilePage } from './components/profile/ProfilePage'
import { EmptyState, ErrorBanner, LoadingOverlay } from './components/common/StateViews'

function AppContent() {
  const { hasFamily, setupFamily, currentTab, isProfileView, uiState } = useApp()

  if (!hasFamily) {
    return <EmptyState onSetup={setupFamily} />
  }

  if (isProfileView) {
    return (
      <div className="relative">
        {uiState === 'loading' && <LoadingOverlay />}
        <ProfilePage />
      </div>
    )
  }

  const pages = {
    overview: <OverviewPage />,
    reminders: <RemindersPage />,
    advisor: <AdvisorPage />,
    protection: <ProtectionPage />,
  }

  return (
    <div className="relative">
      {uiState === 'loading' && <LoadingOverlay />}
      {uiState === 'error' && (
        <ErrorBanner onRetry={() => window.location.reload()} />
      )}
      {pages[currentTab]}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <AppContent />
      </AppShell>
    </AppProvider>
  )
}