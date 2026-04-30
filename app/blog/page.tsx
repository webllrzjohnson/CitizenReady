import Link from 'next/link'
import Image from 'next/image'
import { createPublicSupabaseClient } from '@/lib/supabase/public'
import { fromBlogPosts } from '@/lib/supabase/blog-from'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog & Updates',
  description: 'Tips and guides for Canadian citizenship test preparation.',
}

type PostCard = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  published_at: string | null
  author: { full_name: string | null; email: string } | null
}

export default async function BlogListingPage() {
  const supabase = createPublicSupabaseClient()

  const { data: raw, error } = await fromBlogPosts(supabase)
    .select(
      'id, title, slug, excerpt, cover_image, published_at, author_id',
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const rows =
    (raw ?? []) as unknown as {
      id: string
      title: string
      slug: string
      excerpt: string | null
      cover_image: string | null
      published_at: string | null
      author_id: string
    }[]

  const authorIds = [...new Set(rows.map((r) => r.author_id))]
  const { data: authors } =
    authorIds.length > 0
      ? await supabase.from('profiles').select('id, full_name, email').in('id', authorIds)
      : { data: [] as { id: string; full_name: string | null; email: string }[] }

  const authorMap = new Map((authors ?? []).map((a) => [a.id, a]))

  const posts: PostCard[] = rows.map((r) => ({
    ...r,
    author: authorMap.get(r.author_id) ?? null,
  }))

  return (
    <div className="min-h-screen bg-surface-page">
      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16">
        <header className="mb-10 text-center md:mb-14">
          <h1 className="text-4xl font-bold text-brand-navy md:text-5xl">Blog &amp; Updates</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Tips, guides, and updates for citizenship test preparation
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {posts.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">
              No posts yet. Check back soon.
            </p>
          ) : (
            posts.map((post) => {
              const pub = post.published_at
                ? format(new Date(post.published_at), 'MMMM d, yyyy')
                : ''
              const author =
                post.author?.full_name?.trim() || post.author?.email || 'CitizenReady'
              return (
                <article
                  key={post.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-video w-full bg-muted">
                      {post.cover_image ? (
                        <Image
                          src={post.cover_image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                          No cover image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <time className="text-sm text-gray-500">{pub}</time>
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="mt-2 text-xl font-bold text-brand-navy hover:underline md:text-2xl">
                        {post.title}
                      </h2>
                    </Link>
                    {post.excerpt ? (
                      <p className="mt-3 line-clamp-2 flex-1 text-gray-600 leading-relaxed">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <p className="mt-4 text-sm text-gray-500">By {author}</p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-4 text-sm font-semibold text-brand-red hover:text-brand-red-dark"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
