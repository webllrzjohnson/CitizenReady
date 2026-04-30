import { createClient } from '@/lib/supabase/server'
import { fromBlogPosts } from '@/lib/supabase/blog-from'
import { BlogEditorPage } from '@/components/blog/BlogEditorPage'
import { notFound } from 'next/navigation'
import type { BlogPost } from '@/types'
import type { Json } from '@/types/database.types'

type Params = Promise<{ id: string }>

export default async function AdminEditBlogPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: row, error } = await fromBlogPosts(supabase).select('*').eq('id', id).single()

  if (error || !row) {
    notFound()
  }

  const post = row as {
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

  const defaultValues: Partial<BlogPost> = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    cover_image: post.cover_image,
    content: post.content as Record<string, unknown>,
    author_id: post.author_id,
    status: post.status === 'published' ? 'published' : 'draft',
    published_at: post.published_at,
    created_at: post.created_at,
    updated_at: post.updated_at,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
        <p className="mt-1 text-muted-foreground">Update content and publishing settings</p>
      </div>
      <BlogEditorPage key={post.id} mode="edit" postId={post.id} defaultValues={defaultValues} />
    </div>
  )
}
