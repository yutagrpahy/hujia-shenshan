import { Badge, Button } from '@heroui/react'
import {
  Bell,
  Check,
  ClipboardList,
  FileText,
  History,
  ShoppingBag,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { SuccessBanner } from '../common/StateViews'
import { URGENCY_LABELS } from '../../data/mockData'
import type { AppNotification } from '../../types'

const NOTIF_ICONS = {
  'policy-update': FileText,
  'policy-expiry': Bell,
  'policy-purchase': ShoppingBag,
  'claim-progress': ClipboardList,
}

const URGENCY_STYLES = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-sand-100 text-gray-500',
}

function NotificationCard({
  notif,
  onMarkRead,
}: {
  notif: AppNotification
  onMarkRead: (id: string) => void
}) {
  const unread = !notif.read
  const Icon = NOTIF_ICONS[notif.type]

  const card = (
    <div
      className={`m3-card p-4 flex items-start gap-3 w-full transition-colors ${
        unread ? 'bg-teal-50/40' : 'opacity-70'
      }`}
    >
      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-teal-600" />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <p className={`text-sm font-medium ${unread ? 'text-gray-900' : 'text-gray-600'}`}>
          {notif.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
        <p className="text-[10px] text-gray-400 mt-1">{notif.date}</p>
      </div>

      {unread && (
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          className="text-teal-600 shrink-0"
          aria-label="標記為已讀"
          onPress={() => onMarkRead(notif.id)}
        >
          <Check className="w-4 h-4" />
        </Button>
      )}
    </div>
  )

  if (!unread) return card

  return (
    <Badge.Anchor className="block w-full">
      {card}
      <Badge
        color="danger"
        placement="top-right"
        size="sm"
        variant="primary"
        aria-label="未讀通知"
      />
    </Badge.Anchor>
  )
}

function SegmentTab({
  active,
  label,
  showDot,
  onClick,
}: {
  active: boolean
  label: string
  showDot?: boolean
  onClick: () => void
}) {
  const button = (
    <button
      onClick={onClick}
      className={`m3-segment-btn w-full ${active ? 'active' : ''}`}
    >
      {label}
    </button>
  )

  if (!showDot) return button

  return (
    <Badge.Anchor className="relative flex-1 min-w-0">
      {button}
      <Badge
        color="danger"
        placement="top-right"
        size="sm"
        variant="primary"
        aria-label="有未讀通知"
      />
    </Badge.Anchor>
  )
}

export function RemindersPage() {
  const {
    todos,
    historyTodos,
    notifications,
    completeTodo,
    markNotificationRead,
    uiState,
    reminderSubTab: tab,
    setReminderSubTab: setTab,
  } = useApp()
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-4">
      {uiState === 'success' && (
        <SuccessBanner title="事項已完成" message="已移至歷史事件，並通知相關家人。" />
      )}

      <div className="m3-segment">
        <SegmentTab
          active={tab === 'notifications'}
          label="通知"
          showDot={unreadCount > 0}
          onClick={() => setTab('notifications')}
        />
        <SegmentTab
          active={tab === 'todos'}
          label={`待辦 (${todos.length})`}
          onClick={() => setTab('todos')}
        />
        <SegmentTab
          active={tab === 'history'}
          label="歷史"
          onClick={() => setTab('history')}
        />
      </div>

      {tab === 'todos' && (
        <div className="space-y-2">
          {todos.length === 0 ? (
            <div className="m3-card p-8 text-center">
              <Check className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">所有待辦已完成！</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div key={todo.id} className="m3-card p-4 flex items-start gap-3">
                <button
                  onClick={() => completeTodo(todo.id)}
                  className="w-6 h-6 rounded-full border-2 border-teal-400 flex items-center justify-center shrink-0 mt-0.5 active:bg-teal-50"
                  aria-label="標記完成"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{todo.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{todo.memberName}</span>
                    <span className={`m3-chip ${URGENCY_STYLES[todo.urgency]}`}>
                      {URGENCY_LABELS[todo.urgency]}
                    </span>
                    {todo.dueDate && (
                      <span className="text-[10px] text-gray-400">{todo.dueDate}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {historyTodos.map((todo) => (
            <div key={todo.id} className="m3-card p-4 opacity-70 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 line-through">{todo.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <History className="w-3 h-3 text-gray-300" />
                  <span className="text-[10px] text-gray-400">
                    {todo.memberName} · 完成於 {todo.completedAt}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notif={notif}
              onMarkRead={markNotificationRead}
            />
          ))}
        </div>
      )}
    </div>
  )
}