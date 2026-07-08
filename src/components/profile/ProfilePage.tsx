import { Button, Modal } from '@heroui/react'
import { LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { DocumentVault } from '../common/DocumentVault'
import { HealthProfileEntry, HealthProfileModal } from '../common/HealthProfilePanel'
import { MemberAvatar } from '../common/MemberAvatar'
import { SuccessBanner } from '../common/StateViews'
import { formatCurrency } from '../../utils/calculations'

export function ProfilePage() {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const {
    members,
    documents,
    currentUserId,
    protectionProfile,
    updateProtectionProfile,
    closeProfileView,
    uiState,
  } = useApp()
  const [showHealthProfile, setShowHealthProfile] = useState(false)
  const [showLogoutDemo, setShowLogoutDemo] = useState(false)

  const currentUser = members.find((m) => m.id === currentUserId)
  if (!currentUser) return null

  return (
    <div className="space-y-4">
      <button
        onClick={closeProfileView}
        className="text-sm text-teal-600 font-medium"
      >
        ← 返回
      </button>

      {uiState === 'success' && <SuccessBanner />}

      <div className="m3-card-warm p-4 flex items-center gap-4">
        <MemberAvatar
          name={currentUser.name}
          seed={currentUser.avatarSeed}
          size="lg"
        />
        <div>
          <p className="text-[10px] text-teal-600 font-medium uppercase">登入帳號</p>
          <h3 className="text-lg font-semibold">{currentUser.name}</h3>
          <p className="text-xs text-gray-400">{currentUser.email}</p>
        </div>
      </div>

      <div className="m3-card p-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          個人基本資料
        </h4>
        {[
          ['姓名', currentUser.name],
          ['年齡', `${currentUser.age} 歲`],
          ['職業', currentUser.occupation],
          ['電話', currentUser.phone],
          ['Email', currentUser.email || '—'],
          ['月收入', formatCurrency(currentUser.monthlyIncome)],
          ['月支出', formatCurrency(currentUser.monthlyExpense)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between py-2 border-b border-sand-100 last:border-0"
          >
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-sm font-medium">{value}</span>
          </div>
        ))}
      </div>

      <HealthProfileEntry
        profile={protectionProfile}
        onOpen={() => setShowHealthProfile(true)}
      />

      <DocumentVault
        documents={documents.filter((d) => d.ownerMemberId === currentUserId)}
        canUpload
        title="我的安全文件庫"
      />

      <div className="m3-card p-4">
        <p className="text-xs text-gray-400 mb-3">
          此 App 依登入帳號顯示您的家庭與保單資料。以下為登出示意。
        </p>
        <Button
          variant="secondary"
          fullWidth
          className="border-sand-200 text-gray-600"
          onPress={() => setShowLogoutDemo(true)}
        >
          <LogOut className="w-4 h-4" />
          登出
        </Button>
      </div>

      <HealthProfileModal
        isOpen={showHealthProfile}
        onOpenChange={setShowHealthProfile}
        profile={protectionProfile}
        onSave={updateProtectionProfile}
      />

      <Modal.Backdrop isOpen={showLogoutDemo} onOpenChange={setShowLogoutDemo}>
        <Modal.Container placement={isMobile ? 'bottom' : 'center'}>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>登出示意</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-gray-600 leading-relaxed">
                正式版登出後將清除登入狀態，並依不同帳號載入對應的家庭保障資料。
              </p>
              <p className="text-xs text-gray-400 mt-2">
                目前為 MVP 示意，不會實際登出或切換帳號。
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                fullWidth
                className="btn-accent"
                onPress={() => setShowLogoutDemo(false)}
              >
                了解了
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  )
}