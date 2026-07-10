import type { ChatMessage } from '../types'
import type { AdvisorFamilyContext } from './buildAdvisorContext'
import { buildAdvisorSystemPrompt } from './buildAdvisorContext'

export interface AdvisorChatPayload {
  message: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  context: AdvisorFamilyContext
}

export class AdvisorChatError extends Error {
  readonly code: 'missing_api' | 'network' | 'api_error'

  constructor(message: string, code: 'missing_api' | 'network' | 'api_error') {
    super(message)
    this.name = 'AdvisorChatError'
    this.code = code
  }
}

const ADVISOR_CHAT_TIMEOUT_MS = 45_000

export async function fetchAdvisorChatReply(payload: AdvisorChatPayload): Promise<string> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), ADVISOR_CHAT_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch('/api/advisor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: payload.message,
        history: payload.history,
        systemPrompt: buildAdvisorSystemPrompt(payload.context),
      }),
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AdvisorChatError('AI 回應逾時，請稍後再試', 'network')
    }
    throw new AdvisorChatError('無法連線至 AI 服務', 'network')
  } finally {
    window.clearTimeout(timeoutId)
  }

  const data = (await response.json().catch(() => ({}))) as {
    reply?: string
    error?: string
    code?: string
  }

  if (!response.ok) {
    throw new AdvisorChatError(
      data.error ?? `AI 服務回應錯誤（${response.status}）`,
      data.code === 'missing_api' ? 'missing_api' : 'api_error',
    )
  }

  if (!data.reply?.trim()) {
    throw new AdvisorChatError('AI 未回傳有效內容', 'api_error')
  }

  return data.reply.trim()
}

export function toAdvisorHistory(messages: ChatMessage[]): AdvisorChatPayload['history'] {
  return messages
    .filter((message) => message.id !== 'welcome')
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))
}