import sql from '@/lib/db'
import type { Json } from '@/types/database.types'

export type BlogPostRow = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  content: Json
  author_id: string
  status: string
  published_at: string | null
  created_at: string
  updated_at: string
}

export type ProfileRow = {
  id: string
  full_name: string | null
  email: string
}

export async function getPublishedPosts(): Promise<BlogPostRow[]> {
  const rows = await sql<BlogPostRow[]>`
    SELECT id, title, slug, excerpt, cover_image, published_at, author_id
    FROM public.blog_posts
    WHERE status = 'published'
    ORDER BY published_at DESC
  `
  return rows
}
/*
export async function getPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const rows = await sql<BlogPostRow[]>`
    SELECT id, title, slug, excerpt, cover_image, content, published_at, author_id
    FROM public.blog_posts
    WHERE slug = ${slug} AND status = 'published'
    LIMIT 1
  `
  return rows[0] ?? null
}
*/
export async function getPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const rows = await sql<BlogPostRow[]>`
    SELECT id, title, slug, excerpt, cover_image, content, published_at, author_id
    FROM public.blog_posts
    WHERE slug = ${slug}::text AND status = 'published'
    LIMIT 1
  `
  return rows[0] ?? null
}
/*
export async function getRelatedPosts(excludeSlug: string): Promise<Pick<BlogPostRow, 'title' | 'slug' | 'excerpt' | 'cover_image' | 'published_at'>[]> {
  const rows = await sql<Pick<BlogPostRow, 'title' | 'slug' | 'excerpt' | 'cover_image' | 'published_at'>[]>`
    SELECT title, slug, excerpt, cover_image, published_at
    FROM public.blog_posts
    WHERE status = 'published' AND slug != ${excludeSlug}
    ORDER BY published_at DESC
    LIMIT 5
  `
  return rows
}
*/

export async function getRelatedPosts(excludeSlug: string): Promise<Pick<BlogPostRow, 'title' | 'slug' | 'excerpt' | 'cover_image' | 'published_at'>[]> {
  const rows = await sql<Pick<BlogPostRow, 'title' | 'slug' | 'excerpt' | 'cover_image' | 'published_at'>[]>`
    SELECT title, slug, excerpt, cover_image, published_at
    FROM public.blog_posts
    WHERE status = 'published' AND slug != ${excludeSlug}::text
    ORDER BY published_at DESC
    LIMIT 5
  `
  return rows
}

/*
export async function getProfileById(id: string): Promise<ProfileRow | null> {
  const rows = await sql<ProfileRow[]>`
    SELECT id, full_name, email
    FROM public.profiles
    WHERE id = ${id}
    LIMIT 1
  `
  return rows[0] ?? null
}
*/

export async function getProfileById(id: string): Promise<ProfileRow | null> {
  const rows = await sql<ProfileRow[]>`
    SELECT id, full_name, email
    FROM public.profiles
    WHERE id = ${id}::uuid
    LIMIT 1
  `
  return rows[0] ?? null
}

/*
export async function getProfilesByIds(ids: string[]): Promise<ProfileRow[]> {
  if (ids.length === 0) return []
  const rows = await sql<ProfileRow[]>`
    SELECT id, full_name, email
    FROM public.profiles
    WHERE id = ANY(${sql.array(ids)})
  `
  return rows
}
*/
export async function getProfilesByIds(ids: string[]): Promise<ProfileRow[]> {
  if (ids.length === 0) return []
  const rows = await sql<ProfileRow[]>`
    SELECT id, full_name, email
    FROM public.profiles
    WHERE id = ANY(${sql.array(ids)}::uuid[])
  `
  return rows
}

export async function getPublishedSlugs(): Promise<{ slug: string }[]> {
  return sql<{ slug: string }[]>`
    SELECT slug FROM public.blog_posts WHERE status = 'published'
  `
}