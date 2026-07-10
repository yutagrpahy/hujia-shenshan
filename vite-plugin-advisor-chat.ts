import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

interface ChatRequestBody {
  message?: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
  systemPrompt?: string
}

function readJsonBody(req: IncomingMessage): Promise<ChatRequestBody> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? (JSON.parse(raw) as ChatRequestBody) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

const OPENAI_TIMEOUT_MS = 30_000

function isPlaceholderApiKey(apiKey: string | undefined): boolean {
  if (!apiKey?.trim()) return true
  const normalized = apiKey.trim().toLowerCase()
  return (
    normalized === 'sk-your-key-here' ||
    normalized.includes('your-key') ||
    normalized.includes('replace-me') ||
    normalized === 'sk-xxx'
  )
}

async function fetchOpenAI(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)
  try {
    return await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.65,
        max_tokens: 1200,
        messages,
      }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

async function handleAdvisorChat(req: IncomingMessage, res: ServerResponse, env: NodeJS.ProcessEnv) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const apiKey = env.OPENAI_API_KEY
  if (isPlaceholderApiKey(apiKey)) {
    sendJson(res, 503, {
      error: '尚未設定有效的 OPENAI_API_KEY，請於 .env 檔案填入真實金鑰後重啟開發伺服器',
      code: 'missing_api',
    })
    return
  }

  try {
    const body = await readJsonBody(req)
    const message = body.message?.trim()
    if (!message) {
      sendJson(res, 400, { error: '缺少 message' })
      return
    }

    const model = env.OPENAI_MODEL || 'gpt-4o-mini'
    const history = (body.history ?? []).filter(
      (item) =>
        item &&
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string',
    )

    const openaiResponse = await fetchOpenAI(apiKey!.trim(), model, [
      {
        role: 'system',
        content:
          body.systemPrompt ??
          '你是護家神山 AI 保障顧問，請以繁體中文提供家庭保險規劃建議。',
      },
      ...history.map((item) => ({ role: item.role, content: item.content })),
      { role: 'user', content: message },
    ])

    const openaiData = (await openaiResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>
      error?: { message?: string }
    }

    if (!openaiResponse.ok) {
      sendJson(res, openaiResponse.status, {
        error: openaiData.error?.message ?? 'OpenAI API 錯誤',
        code: 'api_error',
      })
      return
    }

    const reply = openaiData.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      sendJson(res, 502, { error: 'AI 回傳內容為空', code: 'api_error' })
      return
    }

    sendJson(res, 200, { reply })
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError'
    sendJson(res, isTimeout ? 504 : 500, {
      error: isTimeout
        ? 'AI 回應逾時，請稍後再試或檢查網路連線'
        : error instanceof Error
          ? error.message
          : '伺服器錯誤',
      code: 'api_error',
    })
  }
}

function attachAdvisorChatMiddleware(
  middlewares: { use: (path: string, handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void },
  env: NodeJS.ProcessEnv,
) {
  middlewares.use('/api/advisor/chat', (req, res) => {
    void handleAdvisorChat(req, res, env).catch(() => {
      if (!res.writableEnded) {
        sendJson(res, 500, { error: '伺服器錯誤', code: 'api_error' })
      }
    })
  })
}

export function advisorChatPlugin(env: NodeJS.ProcessEnv): Plugin {
  return {
    name: 'advisor-chat-api',
    configureServer(server) {
      attachAdvisorChatMiddleware(server.middlewares, env)
    },
    configurePreviewServer(server) {
      attachAdvisorChatMiddleware(server.middlewares, env)
    },
  }
}