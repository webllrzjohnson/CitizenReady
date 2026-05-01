import Link from 'next/link'
import Image from 'next/image'
import { createPublicSupabaseClient } from '@/lib/supabase/public'
import { fromBlogPosts } from '@/lib/supabase/blog-from'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import { BlogRenderer } from '@/components/blog/BlogRenderer'
import { plainTextFromTiptap } from '@/lib/blog/plain-text'
import { ChevronRight } from 'lucide-react'
import type { Json } from '@/types/database.types'
import { UpgradeCard } from '@/components/marketing/UpgradeBanner'
import { getAdSettings } from '@/lib/ad-settings'
import { AdUnit } from '@/components/ads/AdUnit'
import { AdPlaceholder } from '@/components/ads/AdPlaceholder'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const supabase = createPublicSupabaseClient()
  const { data } = await fromBlogPosts(supabase).select('slug').eq('status', 'published')

  return (data ?? []).map((row: { slug: string }) => ({
    slug: row.slug,
  }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createPublicSupabaseClient()

  const { data: row } = await fromBlogPosts(supabase)
    .select('title, excerpt, cover_image, content')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (!row) {
    return { title: 'Post' }
  }

  const post = row as {
    title: string
    excerpt: string | null
    cover_image: string | null
    content: Json
  }

  const plain =
    post.excerpt?.trim() ||
    plainTextFromTiptap((post.content ?? {}) as Record<string, unknown>).slice(0, 160)

  const description =
    plain.length > 0 ? plain : 'Tips and guides for Canadian citizenship test preparation.'

  const meta: Metadata = {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
    },
  }

  if (post.cover_image) {
    meta.openGraph = {
      ...meta.openGraph,
      images: [{ url: post.cover_image }],
    }
  }

  return meta
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params
  const supabase = createPublicSupabaseClient()

  const { data: raw, error } = await fromBlogPosts(supabase)
    .select(
      'id, title, slug, excerpt, cover_image, content, published_at, author_id',
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !raw) {
    notFound()
  }

  const row = raw as {
    id: string
    title: string
    slug: string
    excerpt: string | null
    cover_image: string | null
    content: Json
    published_at: string | null
    author_id: string
  }

  const { data: authorRow } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', row.author_id)
    .maybeSingle()

  const author = authorRow as { full_name: string | null; email: string } | null

  const post = {
    ...row,
    author,
  }

  const published = post.published_at
    ? format(new Date(post.published_at), 'MMMM d, yyyy')
    : ''
  const authorName =
    post.author?.full_name?.trim() || post.author?.email || 'CitizenReady'

  const contentObj = (post.content ?? {}) as Record<string, unknown>

  const { adsEnabled, clientId } = await getAdSettings()

  const { data: relatedRaw } = await fromBlogPosts(supabase)
    .select('title, slug, excerpt, cover_image, published_at')
    .eq('status', 'published')
    .neq('slug', slug)
    .order('published_at', { ascending: false })
    .limit(5)

  const relatedPosts =
    (relatedRaw ?? []) as {
      title: string
      slug: string
      excerpt: string | null
      cover_image: string | null
      published_at: string | null
    }[]

  return (
    <article className="min-h-screen bg-[#F7F7F7] pb-16">
      {post.cover_image ? (
        <div className="relative mb-12 aspect-video w-full max-h-[min(56vh,560px)] bg-muted md:mb-16">
          <Image
            src={post.cover_image}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            quality={72}
          />
        </div>
      ) : null}

      <div className="container mx-auto max-w-7xl px-4 pt-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-14 xl:gap-16">
          <div className="min-w-0 flex-1 lg:pl-6 xl:pl-10">
            <div className="mx-auto max-w-3xl lg:mx-0">
              <nav className="mb-8 flex flex-wrap items-center gap-1 text-sm text-gray-600">
                <Link href="/" className="hover:text-brand-red">
                  Home
                </Link>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <Link href="/blog" className="hover:text-brand-red">
                  Blog
                </Link>
                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                <span className="line-clamp-1 font-medium text-brand-navy">{post.title}</span>
              </nav>

              <header className="mb-8">
                <p className="text-sm text-gray-500">
                  {published}
                  {published ? ' · ' : null}
                  {authorName}
                </p>
                <h1 className="mt-3 text-4xl font-bold text-brand-navy md:text-5xl">{post.title}</h1>
                {post.excerpt ? (
                  <p className="mt-6 text-xl leading-relaxed text-gray-700">{post.excerpt}</p>
                ) : null}
              </header>

              <BlogRenderer key={post.id} content={contentObj} />

              {/* Rectangle ad after the first part of the article */}
              <div className="my-8">
                {adsEnabled ? (
                  <AdUnit slot="blog-post-mid" clientId={clientId} adsEnabled={adsEnabled} format="rectangle" />
                ) : (
                  <AdPlaceholder format="rectangle" />
                )}
              </div>

              <div className="mt-12 border-t border-surface-border pt-8">
                {/* Leaderboard ad before Back to Blog */}
                <div className="mb-8">
                  {adsEnabled ? (
                    <AdUnit slot="blog-post-bottom" clientId={clientId} adsEnabled={adsEnabled} format="leaderboard" />
                  ) : (
                    <AdPlaceholder format="leaderboard" />
                  )}
                </div>
                <Link
                  href="/blog"
                  className="text-sm font-semibold text-brand-red hover:text-brand-red-dark"
                >
                  ← Back to Blog
                </Link>
              </div>
            </div>
          </div>

          <aside
            className="shrink-0 border-t border-surface-border pt-10 lg:w-72 lg:border-t-0 lg:pt-8 xl:w-80"
            aria-label="More blog posts"
          >
            <div className="lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                More posts
              </h2>
              <ul className="mt-4 space-y-6">
                {relatedPosts.length === 0 ? (
                  <li className="text-sm text-gray-600">More guides are on the way.</li>
                ) : (
                  relatedPosts.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/blog/${r.slug}`} className="group block">
                        <div className="flex gap-3">
                          <div className="relative mt-0.5 h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                            {r.cover_image ? (
                              <Image
                                src={r.cover_image}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="80px"
                                quality={70}
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-brand-navy group-hover:text-brand-red">
                              {r.title}
                            </p>
                            {r.excerpt ? (
                              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{r.excerpt}</p>
                            ) : null}
                            {r.published_at ? (
                              <p className="mt-1 text-xs text-gray-500">
                                {format(new Date(r.published_at), 'MMM d, yyyy')}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
              <Link
                href="/blog"
                className="mt-6 inline-block text-sm font-semibold text-brand-red hover:text-brand-red-dark"
              >
                View all posts →
              </Link>
              <UpgradeCard />
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}
