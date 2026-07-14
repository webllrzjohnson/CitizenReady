import { z } from 'zod'
import { AI_BLOG_SYSTEM_PROMPT, buildAiBlogUserMessage } from '@/lib/blog/ai-prompt'
import {
  AI_PROVIDERS,
  fetchBlogDraftLlmText,
  isAiProviderId,
  resolveBlogDraftModel,
  type AiProviderId,
} from '@/lib/blog/ai-providers'
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

export async function generateBlogDraft(input: {
  title: string
  context: string
  cover_image_url?: string
  provider: AiProviderId
  model: string
  custom_model?: string
}): Promise<{ data: GeneratedBlogDraft } | { error: string }> {
  if (!isAiProviderId(input.provider)) {
    return { error: 'Unsupported AI provider' }
  }

  const model = resolveBlogDraftModel(input.provider, input.model, input.custom_model)
  const userMessage = buildAiBlogUserMessage({
    title: input.title,
    context: input.context,
    cover_image_url: input.cover_image_url,
  })

  const llm = await fetchBlogDraftLlmText({
    provider: input.provider,
    model,
    system: AI_BLOG_SYSTEM_PROMPT,
    user: userMessage,
  })
  if ('error' in llm) return { error: llm.error }

  const llmJsonText = stripJsonFence(llm.text)
  if (!llmJsonText) return { error: 'Model response was empty' }

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

/** @deprecated Use generateBlogDraft */
export async function generateBlogDraftFromClaude(input: {
  title: string
  context: string
  cover_image_url?: string
}): Promise<{ data: GeneratedBlogDraft } | { error: string }> {
  return generateBlogDraft({
    ...input,
    provider: 'anthropic',
    model: AI_PROVIDERS.anthropic.defaultModel,
  })
}
