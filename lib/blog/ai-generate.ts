import { z } from 'zod'
import { AI_BLOG_SYSTEM_PROMPT, buildAiBlogUserMessage } from '@/lib/blog/ai-prompt'
import { blocksToTiptap, slugifyAiSlug, type AiBlogBlock } from '@/lib/blog/blocks-to-tiptap'

const AiModelBlockSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
  src: z.string().optional(),
  alt: z.string().optional(),
  layout: z.string().optional(),
})

const AiModelOutputSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  cover_image: z.string().optional(),
  publish: z.boolean().optional(),
  blocks: z.array(AiModelBlockSchema).optional(),
})

export type GeneratedBlogDraft = {
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  content: ReturnType<typeof blocksToTiptap>
}

function stripJsonFence(s: string): string {
  let t = String(s || '').trim()
  t = t.replace(/^```(?:json)?\s*/i, '')
  t = t.replace(/\s*```$/i, '')
  return t.trim()
}

function httpsOrNull(url: string | undefined | null): string | null {
  const u = String(url || '').trim()
  if (!u) return null
  if (!/^https:\/\//i.test(u)) return null
  return u
}

export async function generateBlogDraftFromClaude(input: {
  title: string
  context: string
  cover_image_url?: string
}): Promise<{ data: GeneratedBlogDraft } | { error: string }> {
  const key = String(process.env.ANTHROPIC_API_KEY ?? '').trim()
  if (!key) return { error: 'ANTHROPIC_API_KEY is not configured.' }

  const model = String(process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6').trim()

  let res: Response
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192,
        temperature: 0.35,
        system: AI_BLOG_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildAiBlogUserMessage(input) }],
      }),
      signal: AbortSignal.timeout(180_000),
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Anthropic request failed' }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    try {
      const errBody = JSON.parse(text) as {
        error?: { message?: string; type?: string }
      }
      const msg = errBody.error?.message?.trim()
      if (msg) return { error: msg }
    } catch {
      // fall through to raw text
    }
    return { error: text.trim().slice(0, 500) || `Anthropic returned ${res.status}` }
  }

  let payload: unknown
  try {
    payload = await res.json()
  } catch {
    return { error: 'Anthropic returned invalid JSON' }
  }

  const content = (payload as { content?: Array<{ type?: string; text?: string }> })?.content
  const textBlock = Array.isArray(content) ? content.find((c) => c.type === 'text') : null
  const llmJsonText = stripJsonFence(textBlock?.text ?? '')
  if (!llmJsonText) return { error: 'Claude response missing text content' }

  let parsedRaw: unknown
  try {
    parsedRaw = JSON.parse(llmJsonText)
  } catch {
    return { error: `Model did not return valid JSON. First 300 chars: ${llmJsonText.slice(0, 300)}` }
  }

  const parsed = AiModelOutputSchema.safeParse(parsedRaw)
  if (!parsed.success) {
    return { error: 'Model JSON did not match the expected blog schema' }
  }

  const ai = parsed.data
  const title = String(ai.title || input.title || '').trim()
  if (!title) return { error: 'Generated draft is missing a title' }

  const slug = slugifyAiSlug(ai.slug || title)
  if (!slug) return { error: 'Could not derive a slug from the title' }

  const excerpt = String(ai.excerpt || '')
    .trim()
    .slice(0, 300)

  const cover_image =
    httpsOrNull(input.cover_image_url) || httpsOrNull(ai.cover_image)

  const blocks = (ai.blocks ?? []) as AiBlogBlock[]
  const tiptap = blocksToTiptap(blocks)
  if (!tiptap.content.length) {
    return { error: 'Generated draft has no content blocks' }
  }

  return {
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      cover_image,
      content: tiptap,
    },
  }
}
