import { Button, Spinner } from '@heroui/react'
import { FlaskConical, MessageSquare, Send, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useElementHeight } from '../../hooks/useElementHeight'
import { MOBILE_BREAKPOINT, useMediaQuery } from '../../hooks/useMediaQuery'
import { useMobileKeyboardOffset } from '../../hooks/useMobileKeyboardOffset'
import { getAdvisorAvatarUrl } from '../../utils/avatars'
import { AI_SUGGESTIONS } from '../../data/mockData'
import { buildAdvisorContext } from '../../services/buildAdvisorContext'
import { fetchAdvisorChatReply, toAdvisorHistory } from '../../services/aiAdvisorChat'
import { generateAIResponse, simulateScenario } from '../../utils/calculations'
import type { ScenarioEventType, ScenarioResult } from '../../types'
import { AdvisorWelcome } from './AdvisorWelcome'
import {
  ScenarioResultModal,
  ScenarioSimulatorForm,
} from './ScenarioSimulatorSheet'

type DockMode = 'chat' | 'simulate'

const WELCOME_MESSAGE =
  '您好！我是護家神山 AI 保障顧問。我可以根據您家庭的保單與人生規劃，提供個人化的保障建議。請直接在下方輸入問題，或點選建議問題快速開始。'

const WELCOME_TYPING_MS = 1000

function delay(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

export function AdvisorPage() {
  const {
    members,
    coverage,
    chatMessages,
    addChatMessage,
    protectionProfile,
  } = useApp()
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [dockMode, setDockMode] = useState<DockMode>('chat')
  const [isActivated, setIsActivated] = useState(
    () => chatMessages.some((message) => message.role === 'user'),
  )
  const [welcomeComplete, setWelcomeComplete] = useState(
    () => chatMessages.length > 0,
  )
  const [isWelcomeTyping, setIsWelcomeTyping] = useState(false)
  const [welcomeTypedText, setWelcomeTypedText] = useState('')
  const [simMemberId, setSimMemberId] = useState(members[0]?.id ?? '')
  const [simEvent, setSimEvent] = useState<ScenarioEventType>('disability')
  const [simAge, setSimAge] = useState(55)
  const [simResult, setSimResult] = useState<ScenarioResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const welcomeStartedRef = useRef(false)
  const chatMessagesRef = useRef(chatMessages)
  chatMessagesRef.current = chatMessages

  const hasUserMessages = chatMessages.some((message) => message.role === 'user')
  const showLanding = !isActivated && !hasUserMessages
  const keyboardOffset = useMobileKeyboardOffset(
    isMobile && isActivated && dockMode === 'chat',
  )
  const dockHeight = useElementHeight(dockRef, [
    dockMode,
    isActivated,
    hasUserMessages,
    isThinking,
    welcomeComplete,
    isWelcomeTyping,
    welcomeTypedText,
  ])

  const scrollToChatEnd = useCallback(() => {
    window.setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }, [])

  const finishWelcomeTyping = useCallback(() => {
    setIsWelcomeTyping(false)
    setWelcomeTypedText('')
    setWelcomeComplete(true)
    if (!chatMessagesRef.current.some((message) => message.role === 'assistant')) {
      addChatMessage(WELCOME_MESSAGE, 'assistant')
    }
    scrollToChatEnd()
  }, [addChatMessage, scrollToChatEnd])

  const startWelcomeTyping = useCallback(() => {
    if (welcomeStartedRef.current || chatMessages.length > 0) {
      setWelcomeComplete(true)
      return
    }
    welcomeStartedRef.current = true
    setWelcomeComplete(false)
    setWelcomeTypedText('')
    setIsWelcomeTyping(true)
  }, [chatMessages.length])

  useEffect(() => {
    if (!isWelcomeTyping) return

    let index = 0
    const stepMs = Math.max(16, WELCOME_TYPING_MS / WELCOME_MESSAGE.length)

    const timer = window.setInterval(() => {
      index += 1
      setWelcomeTypedText(WELCOME_MESSAGE.slice(0, index))
      scrollToChatEnd()

      if (index >= WELCOME_MESSAGE.length) {
        window.clearInterval(timer)
        finishWelcomeTyping()
      }
    }, stepMs)

    return () => window.clearInterval(timer)
  }, [finishWelcomeTyping, isWelcomeTyping, scrollToChatEnd])

  const focusChatInput = useCallback(() => {
    window.setTimeout(() => {
      inputRef.current?.focus()
      if (isMobile) {
        inputRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }, isMobile ? 280 : 120)
  }, [isMobile])

  const enterChat = useCallback(() => {
    setIsActivated(true)
    setDockMode('chat')
    startWelcomeTyping()
    focusChatInput()
  }, [focusChatInput, startWelcomeTyping])

  const enterSimulate = useCallback(() => {
    setIsActivated(true)
    setDockMode('simulate')
  }, [])

  const switchDockMode = useCallback(
    (mode: DockMode) => {
      setDockMode(mode)
      if (mode === 'chat') {
        if (!welcomeStartedRef.current && chatMessages.length === 0) {
          startWelcomeTyping()
        }
        focusChatInput()
      }
    },
    [chatMessages.length, focusChatInput, startWelcomeTyping],
  )

  useEffect(() => {
    if (hasUserMessages) {
      setIsActivated(true)
      setWelcomeComplete(true)
    }
  }, [hasUserMessages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return
    const userText = text.trim()
    setIsActivated(true)
    setDockMode('chat')
    if (isWelcomeTyping) {
      setIsWelcomeTyping(false)
      setWelcomeTypedText('')
      if (!chatMessages.some((message) => message.role === 'assistant')) {
        addChatMessage(WELCOME_MESSAGE, 'assistant')
      }
    }
    setWelcomeComplete(true)
    addChatMessage(userText, 'user')
    setInput('')
    setIsThinking(true)

    const history = toAdvisorHistory(chatMessages)
    const context = buildAdvisorContext(members, coverage, protectionProfile)

    try {
      const reply = await fetchAdvisorChatReply({
        message: userText,
        history,
        context,
      })
      addChatMessage(reply, 'assistant')
    } catch {
      const fallback = generateAIResponse(userText, members, protectionProfile)
      addChatMessage(fallback, 'assistant')
    } finally {
      setIsThinking(false)
      scrollToChatEnd()
    }
  }

  const runSimulation = async () => {
    setShowResultModal(true)
    setSimResult(null)
    setIsSimulating(true)
    await delay(1800)
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
  const scrollPaddingBottom = isMobile && isActivated ? dockHeight + 20 : undefined

  return (
    <div className="flex flex-col advisor-layout-root" style={{ minHeight: 'calc(100dvh - 180px)' }}>
      <div
        className="flex-1 overflow-y-auto mb-2 min-h-0"
        style={scrollPaddingBottom ? { paddingBottom: scrollPaddingBottom } : undefined}
      >
        {showLanding ? (
          <AdvisorWelcome onEnterChat={enterChat} onEnterSimulate={enterSimulate} />
        ) : dockMode === 'simulate' && !hasUserMessages && !isWelcomeTyping ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center min-h-[40dvh]">
            <div className="m3-icon-wrap m3-icon-wrap--md bg-coral-500/10 mb-3">
              <FlaskConical className="w-6 h-6 text-coral-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700">設定模擬條件</p>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed max-w-[240px]">
              在下方選擇成員、年齡與人生情境，即可試算保障缺口
            </p>
          </div>
        ) : (
          <div className="ds-stack-list-loose pt-2">
            {isWelcomeTyping && (
              <div className="flex justify-start">
                <img
                  src={getAdvisorAvatarUrl()}
                  alt="AI 顧問"
                  className="advisor-avatar advisor-avatar--ring w-8 h-8 shrink-0 mr-2 mt-1"
                />
                <div className="max-w-[80%] text-sm leading-relaxed m3-chat-ai">
                  {welcomeTypedText}
                  <span className="advisor-typing-cursor" aria-hidden />
                </div>
              </div>
            )}
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <img
                    src={getAdvisorAvatarUrl()}
                    alt="AI 顧問"
                    className="advisor-avatar advisor-avatar--ring w-8 h-8 shrink-0 mr-2 mt-1"
                  />
                )}
                <div
                  className={`max-w-[80%] text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user' ? 'm3-chat-user' : 'm3-chat-ai'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <img
                  src={getAdvisorAvatarUrl()}
                  alt=""
                  className="advisor-avatar advisor-avatar--ring w-8 h-8 shrink-0 mr-2 mt-1"
                />
                <div className="m3-chat-ai flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-gray-400">思考中...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {isActivated && (
        <div
          ref={dockRef}
          className="advisor-dock shrink-0"
          style={dockBottom ? { bottom: dockBottom } : undefined}
        >
          <div className="advisor-mode-toggle">
            <button
              type="button"
              onClick={() => switchDockMode('chat')}
              className={`advisor-mode-toggle__btn ${dockMode === 'chat' ? 'advisor-mode-toggle__btn--active' : ''}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              對話
            </button>
            <button
              type="button"
              onClick={() => switchDockMode('simulate')}
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

          {dockMode === 'chat' && welcomeComplete && (
            <div className="flex gap-2 overflow-x-auto py-2 px-0.5 mt-2.5 scrollbar-none">
              {AI_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="m3-chip m3-chip--muted shrink-0 whitespace-nowrap hover:bg-teal-50 hover:text-teal-700 transition-colors"
                >
                  <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
                  {suggestion.length > 18 ? `${suggestion.slice(0, 18)}…` : suggestion}
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
                className="m3-field flex-1 min-w-0"
              />
              <Button
                isIconOnly
                className="btn-accent"
                onPress={() => sendMessage(input)}
                isDisabled={!input.trim() || isThinking}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <ScenarioResultModal
        isOpen={showResultModal}
        onOpenChange={setShowResultModal}
        simResult={simResult}
        isSimulating={isSimulating}
      />
    </div>
  )
}