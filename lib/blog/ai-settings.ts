import sql from '@/lib/db'
import {
  AI_PROVIDERS,
  type AiProviderId,
  isAiProviderId,
} from '@/lib/blog/ai-providers'

const PROVIDER_KEY = 'ai_blog_provider'
const MODEL_KEY = 'ai_blog_model'

export type AiBlogSettings = {
  provider: AiProviderId
  model: string
}

function envDefaultProvider(): AiProviderId {
  if (process.env.OPENAI_API_KEY?.trim() && !process.env.ANTHROPIC_API_KEY?.trim()) {
    return 'openai'
  }
  return 'anthropic'
}

function envDefaultModel(provider: AiProviderId): string {
  if (provider === 'anthropic') {
    return String(process.env.ANTHROPIC_MODEL ?? AI_PROVIDERS.anthropic.defaultModel).trim()
  }
  return String(process.env.OPENAI_MODEL ?? AI_PROVIDERS.openai.defaultModel).trim()
}

export async function getAiBlogSettings(): Promise<AiBlogSettings> {
  const rows = await sql<{ key: string; value: string }[]>`
    SELECT key, value FROM public.site_settings
    WHERE key IN (${PROVIDER_KEY}, ${MODEL_KEY})
  `

  const map = new Map(rows.map((r) => [r.key, r.value]))
  const providerRaw = map.get(PROVIDER_KEY)?.trim()
  const provider = providerRaw && isAiProviderId(providerRaw) ? providerRaw : envDefaultProvider()
  const model = map.get(MODEL_KEY)?.trim() || envDefaultModel(provider)

  return { provider, model }
}

export async function saveAiBlogSettings(settings: AiBlogSettings): Promise<void> {
  const entries = [
    { key: PROVIDER_KEY, value: settings.provider },
    { key: MODEL_KEY, value: settings.model },
  ]

  for (const entry of entries) {
    await sql`
      INSERT INTO public.site_settings (key, value, updated_at)
      VALUES (${entry.key}, ${entry.value}, now())
      ON CONFLICT (key) DO UPDATE SET value = ${entry.value}, updated_at = now()
    `
  }
}
