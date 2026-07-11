import { Button, Modal } from '@heroui/react'
import { Link2, LogOut, Pencil, User } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { DocumentVault } from '../common/DocumentVault'
import { HealthProfileEntry, HealthProfileModal } from '../common/HealthProfilePanel'
import { CardSectionTitle, PageStack, Section } from '../common/CardLayout'
import { MemberAvatar } from '../common/MemberAvatar'
import { SuccessBanner } from '../common/StateViews'
import {
  UNION_INFO_SYSTEM_NAME,
  UNION_POLICY_CHIP_LABEL,
} from '../../data/policySourceLabels'
import { formatCurrency } from '../../utils/calculations'
import { EditProfileModal } from './EditProfileModal'

export function ProfilePage() {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const {
    members,
    documents,
    currentUserId,
    protectionProfile,
    updateProtectionProfile,
    updateMemberProfile,
    unionSyncEnabled,
    unionPolicyCount,
    setUnionSyncEnabled,
    closeProfileView,
    uiState,
  } = useApp()
  const [showHealthProfile, setShowHealthProfile] = useState(false)
  const [showLogoutDemo, setShowLogoutDemo] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showUnionConfirm, setShowUnionConfirm] = useState(false)

  const currentUser = members.find((member) => member.id === currentUserId)
  if (!currentUser) return null

  const handleUnionToggle = () => {
    setUnionSyncEnabled(!unionSyncEnabled)
    setShowUnionConfirm(false)
  }

  return (
    <PageStack>
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
          <p className="m3-card-eyebrow">登入帳號</p>
          <h3 className="text-lg font-semibold">{currentUser.name}</h3>
          <p className="text-xs text-gray-400">{currentUser.email}</p>
        </div>
      </div>

      <div className="m3-card p-4">
        <CardSectionTitle
          icon={User}
          actions={
            <Button
              size="sm"
              variant="secondary"
              className="border-teal-200 text-teal-700 shrink-0"
              onPress={() => setShowEditProfile(true)}
            >
              <Pencil className="w-3.5 h-3.5" />
              編輯
            </Button>
          }
        >
          個人基本資料
        </CardSectionTitle>
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

      <div className="m3-card p-4">
        <CardSectionTitle icon={Link2}>保單資料來源綁定</CardSectionTitle>
        <p className="text-sm font-semibold text-gray-800 leading-snug">
          {UNION_INFO_SYSTEM_NAME}
        </p>
        <p className="text-xs text-teal-700 font-medium mt-1.5">
          {unionSyncEnabled ? '已綁定' : '已取消綁定'}
        </p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          {unionSyncEnabled
            ? `已透過${UNION_POLICY_CHIP_LABEL}同步 ${unionPolicyCount} 張保單，全站保障、理賠與總覽資料將即時連動。`
            : `${UNION_POLICY_CHIP_LABEL}保單已從全站隱藏，自行登載保單不受影響。可隨時重新綁定恢復同步。`}
        </p>
        <p className="text-[10px] text-gray-400 mt-2">最近同步：2026-07-08 09:30</p>
        <Button
          fullWidth
          variant="secondary"
          className={`mt-[var(--ds-space-block)] ${unionSyncEnabled ? 'border-red-100 text-red-600' : 'border-teal-200 text-teal-700'}`}
          onPress={() => setShowUnionConfirm(true)}
        >
          {unionSyncEnabled ? '取消綁定資訊系統' : '重新綁定資訊系統'}
        </Button>
      </div>

      <HealthProfileEntry
        profile={protectionProfile}
        onOpen={() => setShowHealthProfile(true)}
      />

      <Section>
        <CardSectionTitle>我的安全文件庫</CardSectionTitle>
        <DocumentVault
          documents={documents.filter((document) => document.ownerMemberId === currentUserId)}
          canUpload
        />
      </Section>

      <div className="m3-card p-4">
        <p className="text-xs text-gray-400 mb-[var(--ds-space-form)]">
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

      <EditProfileModal
        member={currentUser}
        isOpen={showEditProfile}
        onOpenChange={setShowEditProfile}
        onSave={(input) => updateMemberProfile(currentUserId, input)}
      />

      <HealthProfileModal
        isOpen={showHealthProfile}
        onOpenChange={setShowHealthProfile}
        profile={protectionProfile}
        onSave={updateProtectionProfile}
      />

      <Modal.Backdrop isOpen={showUnionConfirm} onOpenChange={setShowUnionConfirm}>
        <Modal.Container placement={isMobile ? 'bottom' : 'center'}>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {unionSyncEnabled ? '取消綁定資訊系統？' : '重新綁定資訊系統？'}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-gray-600 leading-relaxed">
                {unionSyncEnabled
                  ? `取消後將隱藏 ${unionPolicyCount} 張來自「${UNION_INFO_SYSTEM_NAME}」的保單，總覽、理賠與保障頁面會同步更新。自行登載保單不受影響。`
                  : `重新綁定後將恢復 ${unionPolicyCount} 張「${UNION_INFO_SYSTEM_NAME}」保單，並同步更新全站保障資料。`}
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="secondary">
                取消
              </Button>
              <Button className="btn-accent" onPress={handleUnionToggle}>
                {unionSyncEnabled ? '確認取消綁定' : '確認重新綁定'}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

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
    </PageStack>
  )
}