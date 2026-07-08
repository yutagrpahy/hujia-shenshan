import { Button, Spinner } from '@heroui/react'
import { FlaskConical, MessageSquare, Send, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useElementHeight } from '../../hooks/useElementHeight'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { useMobileKeyboardOffset } from '../../hooks/useMobileKeyboardOffset'
import { getAdvisorAvatarUrl } from '../../utils/avatars'
import { AI_SUGGESTIONS } from '../../data/mockData'
import { generateAIResponse, simulateScenario } from '../../utils/calculations'
import type { ScenarioEventType, ScenarioResult } from '../../types'
import { AdvisorWelcome } from './AdvisorWelcome'
import {
  ScenarioResultModal,
  ScenarioSimulatorForm,
} from './ScenarioSimulatorSheet'

type DockMode = 'chat' | 'simulate'

export function AdvisorPage() {
  const { members, chatMessages, addChatMessage, simulateLoading, protectionProfile } = useApp()
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [dockMode, setDockMode] = useState<DockMode>('chat')
  const [simMemberId, setSimMemberId] = useState(members[0]?.id ?? '')
  const [simEvent, setSimEvent] = useState<ScenarioEventType>('disability')
  const [simAge, setSimAge] = useState(55)
  const [simResult, setSimResult] = useState<ScenarioResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasUserMessages = chatMessages.some((m) => m.role === 'user')
  const keyboardOffset = useMobileKeyboardOffset(isMobile && dockMode === 'chat')
  const dockHeight = useElementHeight(dockRef, [dockMode, hasUserMessages, isThinking])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return
    setDockMode('chat')
    addChatMessage(text.trim(), 'user')
    setInput('')
    setIsThinking(true)
    await simulateLoading(1000)
    addChatMessage(generateAIResponse(text, members, protectionProfile), 'assistant')
    setIsThinking(false)
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const openScenario = (event?: ScenarioEventType) => {
    if (event) setSimEvent(event)
    setDockMode('simulate')
  }

  const runSimulation = async () => {
    setShowResultModal(true)
    setSimResult(null)
    setIsSimulating(true)
    await new Promise((r) => setTimeout(r, 1800))
    setSimResult(
      simulateScenario(
        { memberId: simMemberId, event: simEvent, age: simAge },
        members,
        protectionProfile,
      ),
    )
    setIsSimulating(false)
  }

  const dockBottom = isMobile
    ? `calc(var(--advisor-bottom-nav, 84px) + ${keyboardOffset}px)`
    : undefined
  const scrollPaddingBottom = isMobile ? dockHeight + 20 : undefined

  return (
    <div className="flex flex-col advisor-layout-root" style={{ minHeight: 'calc(100dvh - 180px)' }}>
      <div
        className="flex-1 overflow-y-auto mb-2 min-h-0"
        style={scrollPaddingBottom ? { paddingBottom: scrollPaddingBottom } : undefined}
      >
        {!hasUserMessages ? (
          <AdvisorWelcome onSelectScenario={openScenario} onSuggest={sendMessage} />
        ) : (
          <div className="space-y-3 pt-2">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <img
                    src={getAdvisorAvatarUrl()}
                    alt="AI 顧問"
                    className="w-8 h-8 rounded-full shrink-0 mr-2 mt-1 ring-2 ring-teal-100"
                  />
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user' ? 'm3-chat-user' : 'm3-chat-ai'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="m3-chat-ai px-3.5 py-2.5 flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-gray-400">思考中...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div
        ref={dockRef}
        className="advisor-dock shrink-0"
        style={dockBottom ? { bottom: dockBottom } : undefined}
      >
        <div className="advisor-mode-toggle">
          <button
            type="button"
            onClick={() => setDockMode('chat')}
            className={`advisor-mode-toggle__btn ${dockMode === 'chat' ? 'advisor-mode-toggle__btn--active' : ''}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            對話
          </button>
          <button
            type="button"
            onClick={() => setDockMode('simulate')}
            className={`advisor-mode-toggle__btn ${dockMode === 'simulate' ? 'advisor-mode-toggle__btn--active' : ''}`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            情境模擬
          </button>
        </div>

        <div
          className={`advisor-dock-panel ${dockMode === 'simulate' ? 'advisor-dock-panel--open' : ''}`}
        >
          {dockMode === 'simulate' && (
            <div className="advisor-dock-panel__inner">
              <ScenarioSimulatorForm
                members={members}
                simMemberId={simMemberId}
                simEvent={simEvent}
                simAge={simAge}
                isSimulating={isSimulating}
                onMemberChange={setSimMemberId}
                onEventChange={setSimEvent}
                onAgeChange={setSimAge}
                onRun={runSimulation}
                compact
              />
            </div>
          )}
        </div>

        {dockMode === 'chat' && hasUserMessages && (
          <div className="flex gap-2 overflow-x-auto py-2 px-0.5 mt-2.5 scrollbar-none">
            {AI_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                className="shrink-0 text-[10px] px-2.5 py-1.5 bg-sand-100 rounded-full text-gray-600 whitespace-nowrap hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
                {s.length > 18 ? s.slice(0, 18) + '…' : s}
              </button>
            ))}
          </div>
        )}

        {dockMode === 'chat' && (
          <div className="advisor-dock-input-row flex gap-2.5 mt-2.5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              onFocus={() => {
                if (!isMobile) return
                window.setTimeout(() => {
                  inputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
                }, 320)
              }}
              placeholder="詢問保障規劃..."
              className="flex-1 min-w-0 px-3.5 py-2.5 border border-sand-200 rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <Button
              isIconOnly
              onPress={() => sendMessage(input)}
              isDisabled={!input.trim() || isThinking}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <ScenarioResultModal
        isOpen={showResultModal}
        onOpenChange={setShowResultModal}
        simResult={simResult}
        isSimulating={isSimulating}
      />
    </div>
  )
}