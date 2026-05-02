'use server'

import { createClient } from '@/lib/supabase/server'
import { fromBlogPosts } from '@/lib/supabase/blog-from'
import { BlogPostSchema } from '@/lib/validations'
import type { Json } from '@/types/database.types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

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
})

async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || (profile as { role: string } | null)?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  return { supabase, userId: user.id }
}

function normalizeCoverImage(url: string | undefined): string | null {
  if (!url || url.trim() === '') return null
  return url.trim()
}

export async function createPost(formData: FormData) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase, userId } = adminCheck

  const title = (formData.get('title') as string)?.trim() ?? ''
  const slug = (formData.get('slug') as string)?.trim() ?? ''
  const excerptRaw = (formData.get('excerpt') as string)?.trim()
  const excerpt = excerptRaw === '' ? undefined : excerptRaw
  const coverRaw = (formData.get('cover_image') as string)?.trim() ?? ''

  let content: Record<string, unknown>
  try {
    const raw = formData.get('content') as string
    const parsed = JSON.parse(raw || '{}')
    content =
      typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {}
  } catch {
    return { error: 'Invalid content' }
  }

  const status = formData.get('status') as string
  const parsedStatus = status === 'published' ? 'published' : 'draft'

  const validation = BlogPostSchema.safeParse({
    title,
    slug,
    excerpt,
    cover_image: coverRaw,
    content,
    status: parsedStatus,
  })

  if (!validation.success) {
    const msg = validation.error.flatten().formErrors[0] ?? validation.error.errors[0]?.message
    return { error: msg ?? 'Validation failed' }
  }

  const validated = validation.data
  const cover_image = normalizeCoverImage(
    validated.cover_image === '' ? undefined : validated.cover_image,
  )

  const { data: slugConflict } = await fromBlogPosts(supabase)
    .select('id')
    .eq('slug', validated.slug)
    .maybeSingle()

  if (slugConflict) {
    return { error: 'Slug is already in use' }
  }

  const published_at =
    validated.status === 'published' ? new Date().toISOString() : null

  const { error } = await fromBlogPosts(supabase).insert({
    title: validated.title,
    slug: validated.slug,
    excerpt: validated.excerpt ?? null,
    cover_image,
    content: validated.content as Json,
    author_id: userId,
    status: validated.status,
    published_at,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function updatePost(id: string, formData: FormData) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  const title = (formData.get('title') as string)?.trim() ?? ''
  const slug = (formData.get('slug') as string)?.trim() ?? ''
  const excerptRaw = (formData.get('excerpt') as string)?.trim()
  const excerpt = excerptRaw === '' ? undefined : excerptRaw
  const coverRaw = (formData.get('cover_image') as string)?.trim() ?? ''

  let content: Record<string, unknown>
  try {
    const raw = formData.get('content') as string
    const parsed = JSON.parse(raw || '{}')
    content =
      typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {}
  } catch {
    return { error: 'Invalid content' }
  }

  const status = formData.get('status') as string
  const parsedStatus = status === 'published' ? 'published' : 'draft'

  const validation = BlogPostSchema.safeParse({
    title,
    slug,
    excerpt,
    cover_image: coverRaw,
    content,
    status: parsedStatus,
  })

  if (!validation.success) {
    const msg = validation.error.flatten().formErrors[0] ?? validation.error.errors[0]?.message
    return { error: msg ?? 'Validation failed' }
  }

  const validated = validation.data
  const cover_image = normalizeCoverImage(
    validated.cover_image === '' ? undefined : validated.cover_image,
  )

  const { data: existing, error: fetchError } = await fromBlogPosts(supabase)
    .select('id, slug, published_at')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return { error: 'Post not found' }
  }

  const prevSlug = (existing as { slug: string }).slug
  const prevPublishedAt = (existing as { published_at: string | null }).published_at

  const { data: slugConflict } = await fromBlogPosts(supabase)
    .select('id')
    .eq('slug', validated.slug)
    .neq('id', id)
    .maybeSingle()

  if (slugConflict) {
    return { error: 'Slug is already in use' }
  }

  let published_at: string | null = prevPublishedAt
  if (validated.status === 'published' && !prevPublishedAt) {
    published_at = new Date().toISOString()
  }

  const { error } = await fromBlogPosts(supabase)
    .update({
      title: validated.title,
      slug: validated.slug,
      excerpt: validated.excerpt ?? null,
      cover_image,
      content: validated.content as Json,
      status: validated.status,
      published_at,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${validated.slug}`)
  if (prevSlug !== validated.slug) {
    revalidatePath(`/blog/${prevSlug}`)
  }
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function deletePost(id: string) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  const { error } = await fromBlogPosts(supabase).delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return { success: true as const }
}

export async function publishPost(id: string) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  const { error } = await fromBlogPosts(supabase)
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return { success: true as const }
}

export async function unpublishPost(id: string) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const { supabase } = adminCheck

  const { error } = await fromBlogPosts(supabase).update({ status: 'draft' }).eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  return { success: true as const }
}

export async function queueAiBlogDraft(formData: FormData) {
  const adminCheck = await requireAdmin()
  if ('error' in adminCheck) {
    return { error: adminCheck.error }
  }

  const webhookUrl = String(process.env.N8N_BLOG_DRAFT_WEBHOOK_URL ?? '').trim()
  if (!webhookUrl) {
    return {
      error:
        'N8N_BLOG_DRAFT_WEBHOOK_URL is not configured. Add it to your server environment.',
    }
  }

  const parsed = AiBlogDraftSchema.safeParse({
    title: String(formData.get('title') ?? ''),
    context: String(formData.get('context') ?? ''),
    cover_image_url: String(formData.get('cover_image_url') ?? ''),
  })

  if (!parsed.success) {
    const msg =
      parsed.error.flatten().formErrors[0] ??
      parsed.error.errors[0]?.message ??
      'Validation failed'
    return { error: msg }
  }

  const { title, context, cover_image_url } = parsed.data
  const body: { title: string; context: string; cover_image_url?: string } = {
    title,
    context,
  }
  if (cover_image_url) {
    body.cover_image_url = cover_image_url
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(180_000),
    })

    if (!res.ok) {
      const text = await res.text()
      return {
        error:
          text.trim().slice(0, 500) ||
          `Automation returned ${res.status} ${res.statusText}`.trim(),
      }
    }

    return { success: true as const }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Request failed'
    return { error: message }
  }
}
