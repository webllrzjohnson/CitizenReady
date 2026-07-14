'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import sql from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import { generateBlogDraft } from '@/lib/blog/ai-generate'
import {
  isAiProviderId,
  resolveBlogDraftModel,
  type AiProviderId,
} from '@/lib/blog/ai-providers'
import { saveAiBlogSettings } from '@/lib/blog/ai-settings'
import { BlogPostSchema } from '@/lib/validations'

const AiBlogDraftSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300),
  context: z.string().trim().min(1, 'Context is required').max(60_000),
  cover_image_url: z
    .string()
    .trim()
    .optional()
    .transform((s) => (s === '' ? undefined : s))
    .refine((s) => s === undefined || /^https:\/\//i.test(s), {
      message: 'Cover image must be an https URL',
    }),
  provider: z.string().trim(),
  model: z.string().trim().min(1, 'Model is required').max(120),
  custom_model: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((s) => (s === '' ? undefined : s)),
  save_as_default: z
    .string()
    .optional()
    .transform((s) => s === 'true'),
})

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }
  if (session.role !== 'admin') return { error: 'Unauthorized' }
  return { userId: session.id }
}

function normalizeCoverImage(url: string | undefined): string | null {
  if (!url || url.trim() === '') return null
  return url.trim()
}

export async function createPost(formData: FormData) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  const title = (formData.get('title') as string)?.trim() ?? ''
  const slug = (formData.get('slug') as string)?.trim() ?? ''
  const excerptRaw = (formData.get('excerpt') as string)?.trim()
  const excerpt = excerptRaw === '' ? undefined : excerptRaw
  const coverRaw = (formData.get('cover_image') as string)?.trim() ?? ''

  let content: Record<string, unknown>
  try {
    const raw = formData.get('content') as string
    const parsed = JSON.parse(raw || '{}')
    content = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return { error: 'Invalid content' }
  }

  const status = formData.get('status') as string
  const parsedStatus = status === 'published' ? 'published' : 'draft'

  const validation = BlogPostSchema.safeParse({ title, slug, excerpt, cover_image: coverRaw, content, status: parsedStatus })
  if (!validation.success) {
    return { error: validation.error.flatten().formErrors[0] ?? validation.error.errors[0]?.message ?? 'Validation failed' }
  }

  const validated = validation.data
  const cover_image = normalizeCoverImage(validated.cover_image === '' ? undefined : validated.cover_image)

  const existing = await sql`SELECT id FROM public.blog_posts WHERE slug = ${validated.slug} LIMIT 1`
  if (existing.length > 0) return { error: 'Slug is already in use' }

  const published_at = validated.status === 'published' ? new Date().toISOString() : null

  await sql`
    INSERT INTO public.blog_posts (title, slug, excerpt, cover_image, content, author_id, status, published_at)
    VALUES (${validated.title}, ${validated.slug}, ${validated.excerpt ?? null}, ${cover_image},
            ${JSON.stringify(validated.content)}, ${check.userId}::uuid, ${validated.status}, ${published_at})
  `

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function updatePost(id: string, formData: FormData) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  const title = (formData.get('title') as string)?.trim() ?? ''
  const slug = (formData.get('slug') as string)?.trim() ?? ''
  const excerptRaw = (formData.get('excerpt') as string)?.trim()
  const excerpt = excerptRaw === '' ? undefined : excerptRaw
  const coverRaw = (formData.get('cover_image') as string)?.trim() ?? ''

  let content: Record<string, unknown>
  try {
    const raw = formData.get('content') as string
    const parsed = JSON.parse(raw || '{}')
    content = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return { error: 'Invalid content' }
  }

  const status = formData.get('status') as string
  const parsedStatus = status === 'published' ? 'published' : 'draft'

  const validation = BlogPostSchema.safeParse({ title, slug, excerpt, cover_image: coverRaw, content, status: parsedStatus })
  if (!validation.success) {
    return { error: validation.error.flatten().formErrors[0] ?? validation.error.errors[0]?.message ?? 'Validation failed' }
  }

  const validated = validation.data
  const cover_image = normalizeCoverImage(validated.cover_image === '' ? undefined : validated.cover_image)

  const existing = await sql`SELECT slug, published_at FROM public.blog_posts WHERE id = ${id}::uuid LIMIT 1`
  if (existing.length === 0) return { error: 'Post not found' }

  const prevSlug = existing[0].slug
  const prevPublishedAt = existing[0].published_at

  const slugConflict = await sql`SELECT id FROM public.blog_posts WHERE slug = ${validated.slug} AND id != ${id}::uuid LIMIT 1`
  if (slugConflict.length > 0) return { error: 'Slug is already in use' }

  let published_at = prevPublishedAt
  if (validated.status === 'published' && !prevPublishedAt) {
    published_at = new Date().toISOString()
  }

  await sql`
    UPDATE public.blog_posts SET
      title = ${validated.title},
      slug = ${validated.slug},
      excerpt = ${validated.excerpt ?? null},
      cover_image = ${cover_image},
      content = ${JSON.stringify(validated.content)},
      status = ${validated.status},
      published_at = ${published_at}
    WHERE id = ${id}::uuid
  `

  revalidatePath('/blog')
  revalidatePath(`/blog/${validated.slug}`)
  if (prevSlug !== validated.slug) revalidatePath(`/blog/${prevSlug}`)
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function deletePost(id: string) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  await sql`DELETE FROM public.blog_posts WHERE id = ${id}::uuid`
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return { success: true as const }
}

export async function publishPost(id: string) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  await sql`UPDATE public.blog_posts SET status = 'published', published_at = now() WHERE id = ${id}::uuid`
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return { success: true as const }
}

export async function unpublishPost(id: string) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  await sql`UPDATE public.blog_posts SET status = 'draft' WHERE id = ${id}::uuid`
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return { success: true as const }
}

export async function generateAiBlogDraft(formData: FormData) {
  const check = await requireAdmin()
  if ('error' in check) return { error: check.error }

  const parsed = AiBlogDraftSchema.safeParse({
    title: String(formData.get('title') ?? ''),
    context: String(formData.get('context') ?? ''),
    cover_image_url: String(formData.get('cover_image_url') ?? ''),
    provider: String(formData.get('provider') ?? 'anthropic'),
    model: String(formData.get('model') ?? ''),
    custom_model: String(formData.get('custom_model') ?? ''),
    save_as_default: String(formData.get('save_as_default') ?? 'false'),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors[0] ?? parsed.error.errors[0]?.message ?? 'Validation failed' }
  }

  const { title, context, cover_image_url, provider: providerRaw, model, custom_model, save_as_default } =
    parsed.data

  if (!isAiProviderId(providerRaw)) {
    return { error: 'Unsupported AI provider' }
  }
  const provider = providerRaw as AiProviderId

  const resolvedModel = resolveBlogDraftModel(provider, model, custom_model)

  const generated = await generateBlogDraft({
    title,
    context,
    cover_image_url,
    provider,
    model,
    custom_model,
  })
  if ('error' in generated) return { error: generated.error }

  if (save_as_default) {
    await saveAiBlogSettings({ provider, model: resolvedModel })
    revalidatePath('/admin/blog/ai-draft')
  }

  const draft = generated.data

  const existing = await sql`SELECT id FROM public.blog_posts WHERE slug = ${draft.slug} LIMIT 1`
  if (existing.length > 0) {
    return { error: `Slug "${draft.slug}" is already in use. Try a more specific title.` }
  }

  const rows = await sql`
    INSERT INTO public.blog_posts (title, slug, excerpt, cover_image, content, author_id, status, published_at)
    VALUES (
      ${draft.title},
      ${draft.slug},
      ${draft.excerpt},
      ${draft.cover_image},
      ${JSON.stringify(draft.content)},
      ${check.userId}::uuid,
      'draft',
      NULL
    )
    RETURNING id, slug
  `

  const row = rows[0] as { id: string; slug: string } | undefined
  if (!row) return { error: 'Failed to save draft' }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')

  return { success: true as const, data: { id: row.id, slug: row.slug } }
}