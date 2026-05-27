import sql from '@/lib/db'
import { BlogEditorPage } from '@/components/blog/BlogEditorPage'
import { notFound } from 'next/navigation'
import type { BlogPost } from '@/types'

export const dynamic = 'force-dynamic'

type Params = Promise<{ id: string }>

export default async function AdminEditBlogPage({ params }: { params: Params }) {
  const { id } = await params

  const rows = await sql`SELECT * FROM public.blog_posts WHERE id = ${id}::uuid LIMIT 1`
  if (rows.length === 0) notFound()

  const post = rows[0]
  const content = typeof post.content === 'string' ? JSON.parse(post.content) : post.content

  const defaultValues: Partial<BlogPost> = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    cover_image: post.cover_image,
    content,
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