import { Button, Modal } from '@heroui/react'
import {
  AlertCircle,
  Calendar,
  ChevronRight,
  Phone,
  Shield,
  UserCircle,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { buildPolicyDetailContext } from '../../data/policyDetails'
import { PolicySourceLabel } from '../common/PolicySourceLabel'
import { getAdvisorAvatarUrl } from '../../utils/avatars'
import type { PolicyWithMember } from '../../types'
import { MemberAvatar } from '../common/MemberAvatar'

const STATUS_STYLES = {
  success: 'bg-teal-50 text-teal-700 border-teal-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
  info: 'bg-sand-100 text-gray-600 border-sand-200',
}

const POLICY_TYPE_LABELS: Record<PolicyWithMember['policy']['type'], string> = {
  life: '壽險',
  health: '醫療',
  accident: '意外',
  longterm: '長照',
  savings: '年金',
  disability: '失能',
  critical: '重大疾病',
}

export function PolicyDetailModal({
  item,
  isOpen,
  onOpenChange,
  isMobile,
}: {
  item: PolicyWithMember | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isMobile: boolean
}) {
  const { members } = useApp()
  if (!item) return null

  const detail = buildPolicyDetailContext(item, members)
  const { policy, agent } = detail

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement={isMobile ? 'bottom' : 'center'} scroll="inside" size="lg">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>保單詳情</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div className="m3-card-warm p-4">
                <div className="flex items-start gap-3">
                  <MemberAvatar
                    name={detail.memberName}
                    seed={detail.avatarSeed}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-800 leading-snug">
                      {policy.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {detail.memberName} · {policy.insurer}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="m3-chip bg-teal-50 text-teal-600">
                        {POLICY_TYPE_LABELS[policy.type]}
                      </span>
                      <span
                        className={`m3-chip border ${STATUS_STYLES[detail.statusTone]}`}
                      >
                        {detail.statusLabel}
                      </span>
                      <PolicySourceLabel source={policy.source} />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`m3-panel border p-3.5 ${STATUS_STYLES[detail.statusTone]}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-sm font-semibold">{detail.situationTitle}</p>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{detail.situationSummary}</p>
              </div>

              <div className="m3-card p-4 space-y-2.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  保單摘要
                </p>
                {detail.detailRows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-3 text-sm">
                    <span className="text-xs text-gray-400 shrink-0">{row.label}</span>
                    <span className="text-xs text-gray-700 text-right font-medium">{row.value}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  建議下一步
                </p>
                <div className="space-y-2">
                  {detail.ctas.map((cta) => (
                    <button
                      key={cta.id}
                      type="button"
                      className={`w-full text-left m3-panel border p-3.5 transition-colors ${
                        cta.variant === 'primary'
                          ? 'bg-teal-50 border-teal-100 hover:bg-teal-100/70'
                          : 'bg-white border-sand-200 hover:bg-sand-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm font-medium ${
                            cta.variant === 'primary' ? 'text-teal-700' : 'text-gray-700'
                          }`}
                        >
                          {cta.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{cta.description}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 px-1">
                  以上為示意操作，正式版將連結客服系統與文件上傳功能。
                </p>
              </div>

              <div className="m3-card-warm p-4">
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                  <UserCircle className="w-3.5 h-3.5" />
                  專屬保險業務員
                </p>
                <div className="flex gap-3">
                  <img
                    src={getAdvisorAvatarUrl()}
                    alt={agent.name}
                    className="member-avatar member-avatar--default w-12 h-12 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{agent.name}</p>
                    <p className="text-xs text-teal-600">{agent.title}</p>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{agent.reason}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-teal-500" />
                      <a href={`tel:${agent.phone.replace(/-/g, '')}`} className="hover:underline">
                        {agent.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      服務時間：週一至週五 09:00–18:00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              關閉
            </Button>
            <Button className="btn-accent" onPress={() => {}}>
              <Phone className="w-4 h-4" />
              聯絡 {agent.name}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}