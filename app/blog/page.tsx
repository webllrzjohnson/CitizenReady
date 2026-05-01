import Link from 'next/link'
import Image from 'next/image'
import { createPublicSupabaseClient } from '@/lib/supabase/public'
import { fromBlogPosts } from '@/lib/supabase/blog-from'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import { BookOpen, Newspaper, Zap } from 'lucide-react'
import { UpgradeBanner } from '@/components/marketing/UpgradeBanner'
import { getAdSettings } from '@/lib/ad-settings'
import { AdUnit } from '@/components/ads/AdUnit'
import { AdPlaceholder } from '@/components/ads/AdPlaceholder'

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

  const { adsEnabled, clientId } = await getAdSettings()

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[#E0E0E0] bg-[#1B2A4A] text-white shadow-nav">
        <div className="container relative mx-auto max-w-5xl px-4 py-12 md:py-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-red/20 px-3 py-1.5 ring-1 ring-brand-red/30">
            <Newspaper className="h-3.5 w-3.5 text-brand-red" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-red">
              CitizenReady Blog
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Tips, guides &amp; <span className="text-brand-red">updates</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
            Study strategies, citizenship test insights, and guides to help you prepare with confidence.
          </p>
        </div>
      </div>

      {/* Social proof strip */}
      <div className="border-b border-[#E0E0E0] bg-white">
        <div className="container mx-auto max-w-5xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-brand-navy" aria-hidden="true" />
              Study tips from real applicants
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-brand-red" aria-hidden="true" />
              Updated for 2026 test format
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-8">
          <UpgradeBanner />
        </div>

        {/* Leaderboard ad below the featured upgrade banner */}
        <div className="mb-8">
          {adsEnabled ? (
            <AdUnit slot="blog-list-leaderboard" clientId={clientId} adsEnabled={adsEnabled} format="leaderboard" />
          ) : (
            <AdPlaceholder format="leaderboard" />
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {posts.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
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
                  className="flex flex-col overflow-hidden rounded-[12px] border border-[#E0E0E0] bg-white shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <Link href={`/blog/${post.slug}`} className="block" tabIndex={-1} aria-hidden="true">
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100">
                      {post.cover_image ? (
                        <Image
                          src={post.cover_image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 640px"
                          quality={72}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#1B2A4A]">
                          <span className="text-4xl" aria-hidden>🍁</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <time className="text-xs text-gray-400">{pub}</time>
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="mt-2 text-xl font-bold text-brand-navy hover:text-brand-red transition-colors md:text-2xl">
                        {post.title}
                      </h2>
                    </Link>
                    {post.excerpt ? (
                      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-600">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-gray-400">By {author}</p>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm font-semibold text-brand-red hover:text-brand-red-dark"
                        aria-label={`Read more: ${post.title}`}
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>

        {/* Rectangle ad at the bottom of the recent posts grid */}
        <div className="mt-10">
          {adsEnabled ? (
            <AdUnit slot="blog-list-rectangle" clientId={clientId} adsEnabled={adsEnabled} format="rectangle" />
          ) : (
            <AdPlaceholder format="rectangle" />
          )}
        </div>
      </div>
    </div>
  )
}
