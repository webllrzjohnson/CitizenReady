import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { fromBlogPosts } from '@/lib/supabase/blog-from'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { BlogPost } from '@/types'
import { BlogPublishToggle } from '@/components/blog/BlogPublishToggle'
import { DeletePostDialog } from '@/components/blog/DeletePostDialog'

type PostRow = {
  id: string
  title: string
  slug: string
  status: string
  published_at: string | null
  updated_at: string
  author_id: string
  author: { full_name: string | null; email: string } | null
}

export default async function AdminBlogListPage() {
  const supabase = await createClient()

  const { data: raw, error } = await fromBlogPosts(supabase)
    .select('id, title, slug, status, published_at, updated_at, author_id')
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const rows =
    (raw ?? []) as unknown as {
      id: string
      title: string
      slug: string
      status: string
      published_at: string | null
      updated_at: string
      author_id: string
    }[]

  const authorIds = [...new Set(rows.map((r) => r.author_id))]
  const { data: authors } =
    authorIds.length > 0
      ? await supabase.from('profiles').select('id, full_name, email').in('id', authorIds)
      : { data: [] as { id: string; full_name: string | null; email: string }[] }

  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]))

  const posts: PostRow[] = rows.map((r) => ({
    ...r,
    author: authorMap.get(r.author_id) ?? null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="mt-1 text-muted-foreground">Create and manage your blog content</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/blog/ai-draft">AI draft</Link>
          </Button>
          <Button className="bg-brand-red text-white hover:bg-brand-red-dark" asChild>
            <Link href="/admin/blog/new">+ New Post</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No posts yet. Create your first post.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => {
                const status = post.status === 'published' ? 'published' : 'draft'
                const dateStr = post.published_at ?? post.updated_at
                const date = dateStr ? format(new Date(dateStr), 'MMM d, yyyy') : '—'
                const authorName =
                  post.author?.full_name?.trim() || post.author?.email || '—'
                return (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      {status === 'published' ? (
                        <Badge className="border-0 bg-green-100 font-medium text-green-800 hover:bg-green-100">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-medium text-gray-700">
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{authorName}</TableCell>
                    <TableCell className="text-muted-foreground">{date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/blog/${post.id}/edit`}>Edit</Link>
                        </Button>
                        <BlogPublishToggle
                          postId={post.id}
                          status={status as BlogPost['status']}
                        />
                        <DeletePostDialog
                          postId={post.id}
                          postTitle={post.title}
                          trigger={
                            <Button variant="ghost" size="sm" className="text-destructive">
                              Delete
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
