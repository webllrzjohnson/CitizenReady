export const AI_PROVIDER_IDS = ['anthropic', 'openai'] as const

export type AiProviderId = (typeof AI_PROVIDER_IDS)[number]

export type AiProviderConfig = {
  id: AiProviderId
  label: string
  envKey: string
  defaultModel: string
  models: { id: string; label: string }[]
}

export const AI_PROVIDERS: Record<AiProviderId, AiProviderConfig> = {
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    envKey: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-sonnet-4-6',
    models: [
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
      { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
    ],
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4.1', label: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
      { id: 'o3-mini', label: 'o3-mini' },
    ],
  },
}

export const AI_CUSTOM_MODEL_VALUE = '__custom__'

export function isAiProviderId(value: string): value is AiProviderId {
  return (AI_PROVIDER_IDS as readonly string[]).includes(value)
}

export function getProviderApiKey(provider: AiProviderId): string | null {
  const key = String(process.env[AI_PROVIDERS[provider].envKey] ?? '').trim()
  return key || null
}

export function resolveBlogDraftModel(
  provider: AiProviderId,
  modelSelection: string,
  customModel?: string,
): string {
  if (modelSelection === AI_CUSTOM_MODEL_VALUE) {
    const custom = String(customModel ?? '').trim()
    if (custom) return custom
  } else if (modelSelection.trim()) {
    return modelSelection.trim()
  }
  return AI_PROVIDERS[provider].defaultModel
}

export function modelSelectionFromStored(
  provider: AiProviderId,
  storedModel: string,
): { selection: string; customModel: string } {
  const model = storedModel.trim() || AI_PROVIDERS[provider].defaultModel
  const preset = AI_PROVIDERS[provider].models.find((m) => m.id === model)
  if (preset) {
    return { selection: preset.id, customModel: '' }
  }
  return { selection: AI_CUSTOM_MODEL_VALUE, customModel: model }
}

export async function fetchBlogDraftLlmText(opts: {
  provider: AiProviderId
  model: string
  system: string
  user: string
}): Promise<{ text: string } | { error: string }> {
  const apiKey = getProviderApiKey(opts.provider)
  if (!apiKey) {
    return { error: `${AI_PROVIDERS[opts.provider].envKey} is not configured.` }
  }

  if (opts.provider === 'anthropic') {
    return fetchAnthropicText({ apiKey, ...opts })
  }

  return fetchOpenAiText({ apiKey, ...opts })
}

async function fetchAnthropicText(opts: {
  apiKey: string
  model: string
  system: string
  user: string
}): Promise<{ text: string } | { error: string }> {
  let res: Response
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': opts.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: 8192,
        temperature: 0.35,
        system: opts.system,
        messages: [{ role: 'user', content: opts.user }],
      }),
      signal: AbortSignal.timeout(180_000),
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Anthropic request failed' }
  }

  if (!res.ok) {
    return { error: await readApiError(res, 'Anthropic') }
  }

  let payload: unknown
  try {
    payload = await res.json()
  } catch {
    return { error: 'Anthropic returned invalid JSON' }
  }

  const content = (payload as { content?: Array<{ type?: string; text?: string }> })?.content
  const textBlock = Array.isArray(content) ? content.find((c) => c.type === 'text') : null
  const text = String(textBlock?.text ?? '').trim()
  if (!text) return { error: 'Anthropic response missing text content' }

  return { text }
}

async function fetchOpenAiText(opts: {
  apiKey: string
  model: string
  system: string
  user: string
}): Promise<{ text: string } | { error: string }> {
  let res: Response
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: 8192,
        temperature: 0.35,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: opts.user },
        ],
      }),
      signal: AbortSignal.timeout(180_000),
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'OpenAI request failed' }
  }

  if (!res.ok) {
    return { error: await readApiError(res, 'OpenAI') }
  }

  let payload: unknown
  try {
    payload = await res.json()
  } catch {
    return { error: 'OpenAI returned invalid JSON' }
  }

  const text = String(
    (payload as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message
      ?.content ?? '',
  ).trim()
  if (!text) return { error: 'OpenAI response missing text content' }

  return { text }
}

async function readApiError(res: Response, label: string): Promise<string> {
  const text = await res.text().catch(() => '')
  try {
    const body = JSON.parse(text) as {
      error?: { message?: string }
      message?: string
    }
    const msg = body.error?.message?.trim() || body.message?.trim()
    if (msg) return msg
  } catch {
    // fall through
  }
  return text.trim().slice(0, 500) || `${label} returned ${res.status}`
}
