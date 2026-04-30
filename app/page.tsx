import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { BookOpen, Clock, BarChart2, ArrowRight, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Free Canadian Citizenship Exam Practice',
  description:
    'Practice for your Canadian citizenship test with 1,000+ questions, timed mock exams, and topic-by-topic study guides. Free forever.',
}

const LANDING_CHAPTERS = [
  {
    n: 1,
    name: 'Rights and Responsibilities',
    description: 'Canadian citizenship rights and responsibilities',
    questions: '90+',
  },
  {
    n: 2,
    name: 'Who Are Canadians',
    description: 'Canadian identity, diversity, and Indigenous peoples',
    questions: '90+',
  },
  {
    n: 3,
    name: "Canada's History",
    description: 'Historical events and milestones in Canadian history',
    questions: '90+',
  },
  {
    n: 4,
    name: 'Government',
    description: 'Canadian government structure and institutions',
    questions: '90+',
  },
  {
    n: 5,
    name: 'Federal Elections',
    description: 'Electoral system and voting process',
    questions: '90+',
  },
  {
    n: 6,
    name: 'Justice System',
    description: 'Canadian laws and justice system',
    questions: '90+',
  },
  {
    n: 7,
    name: 'Canadian Symbols',
    description: 'National symbols and heritage',
    questions: '90+',
  },
  {
    n: 8,
    name: "Canada's Regions",
    description: 'Geographic regions and provincial characteristics',
    questions: '90+',
  },
  {
    n: 9,
    name: "Canada's Economy",
    description: 'Economic sectors and industries',
    questions: '90+',
  },
  {
    n: 10,
    name: 'Modern Canada',
    description: 'Contemporary Canadian society and culture',
    questions: '90+',
  },
  {
    n: 11,
    name: 'Applying for Citizenship',
    description: 'Citizenship application process and requirements',
    questions: '90+',
  },
]

const TESTIMONIALS = [
  {
    quote:
      'I passed on my first try. The timed mock exams felt exactly like the real thing — I walked into the test centre confident.',
    name: 'Priya K.',
    province: 'Ontario',
  },
  {
    quote:
      'Chapter practice made it easy to study after work. Seeing my weak topics helped me focus where I needed it most.',
    name: 'Marcus T.',
    province: 'British Columbia',
  },
]

type LandingFeaturedPost = Pick<
  Database['public']['Tables']['blog_posts']['Row'],
  'id' | 'title' | 'slug' | 'excerpt' | 'cover_image' | 'published_at' | 'author_id'
>

type LandingRecentPost = Pick<
  Database['public']['Tables']['blog_posts']['Row'],
  'id' | 'title' | 'slug' | 'excerpt' | 'cover_image' | 'published_at'
>

function formatBlogDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredPostRaw } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, published_at, author_id')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  const featuredPost = featuredPostRaw as LandingFeaturedPost | null

  let recent: LandingRecentPost[] = []

  if (featuredPost) {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, published_at')
      .eq('status', 'published')
      .neq('id', featuredPost.id)
      .order('published_at', { ascending: false })
      .limit(3)
    recent = (data ?? []) as LandingRecentPost[]
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-brand-navy text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="space-y-8">
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                Pass Your Canadian Citizenship Test
              </h1>
              <p className="max-w-xl text-lg text-gray-300 md:text-xl">
                Practice with 1,001 questions, take timed mock exams, track your progress. Free
                forever.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-brand-red px-8 text-base text-white hover:bg-brand-red-dark"
                  asChild
                >
                  <Link href="/dashboard">
                    Start practicing — no account needed
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/signup">Sign up to save progress</Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-full px-8 text-base text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <a href="#how-to-prepare">See How It Works</a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                {['1,001 Questions', '11 Topics', 'Free Forever'].map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-brand-navy-light px-4 py-2 text-sm font-medium text-white"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div
                className="flex h-48 w-48 select-none items-center justify-center rounded-full bg-brand-navy-light text-8xl shadow-xl md:h-64 md:w-64 md:text-9xl"
                aria-hidden
              >
                🍁
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to prepare */}
      <section id="how-to-prepare" className="bg-surface-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-brand-navy md:text-4xl">
            How to Prepare
          </h2>
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3 md:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-red-light text-brand-red">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-brand-navy">Take a Practice Test</h3>
              <p className="text-[#424242]">
                Study each chapter of Discover Canada with topic-specific questions
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-red-light text-brand-red">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-brand-navy">Simulate the Real Exam</h3>
              <p className="text-[#424242]">
                20 questions, 30 minute timer, 75% to pass — just like the real test
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-red-light text-brand-red">
                <BarChart2 className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-brand-navy">Track Your Progress</h3>
              <p className="text-[#424242]">
                See your improvement over time and identify weak topics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section id="topics" className="bg-surface-page py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-brand-navy md:text-4xl">
              Practice by Chapter
            </h2>
            <p className="text-lg text-[#424242]">Complete all chapters to be fully prepared</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_CHAPTERS.map((ch) => (
              <div
                key={ch.n}
                className="group flex flex-col rounded-xl border border-surface-border bg-surface-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-red text-lg font-bold text-white">
                    {ch.n}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-brand-navy">{ch.name}</h3>
                    <p className="mt-1 text-sm text-[#424242]">{ch.description}</p>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-surface-border pt-4">
                  <span className="rounded-full bg-brand-red-light px-3 py-1 text-xs font-semibold text-brand-red">
                    {ch.questions} questions
                  </span>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red hover:text-brand-red-dark"
                  >
                    Start Practice
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="success-stories" className="bg-surface-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-brand-navy md:text-4xl">
            Success Stories
          </h2>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-surface-border bg-surface-page p-8 shadow-sm"
              >
                <p className="mb-4 italic text-[#424242]">&ldquo;{t.quote}&rdquo;</p>
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-brand-red text-brand-red" />
                  ))}
                </div>
                <p className="font-semibold text-brand-navy">{t.name}</p>
                <p className="text-sm text-[#424242]">{t.province}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      {featuredPost ? (
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-3xl font-bold text-brand-navy md:text-4xl">From the Blog</h2>
              <Link
                href="/blog"
                className="text-base font-semibold text-brand-red hover:text-brand-red-dark"
              >
                View All Posts →
              </Link>
            </div>

            <div className="mb-10 overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm">
              <div className="flex flex-col md:flex-row md:items-stretch">
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-t-xl md:w-[60%] md:rounded-l-xl md:rounded-tr-none">
                  {featuredPost.cover_image ? (
                    <Image
                      src={featuredPost.cover_image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                  ) : (
                    <div className="flex h-full min-h-[12rem] w-full items-center justify-center bg-gradient-to-br from-brand-navy to-brand-navy-light md:min-h-0">
                      <span className="text-6xl" aria-hidden>
                        🍁
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex w-full flex-col justify-center gap-3 p-6 md:w-[40%] md:p-8">
                  <span className="inline-flex w-fit rounded-full bg-brand-red px-2.5 py-0.5 text-xs font-semibold text-white">
                    Featured
                  </span>
                  <p className="text-sm text-gray-500">
                    {formatBlogDate(featuredPost.published_at)}
                  </p>
                  <h3 className="line-clamp-2 text-2xl font-bold text-brand-navy">
                    {featuredPost.title}
                  </h3>
                  {featuredPost.excerpt ? (
                    <p className="line-clamp-3 text-gray-600">{featuredPost.excerpt}</p>
                  ) : null}
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      className="rounded-full border-2 border-brand-red bg-transparent text-brand-red hover:bg-brand-red-light hover:text-brand-red-dark"
                      asChild
                    >
                      <Link href={`/blog/${featuredPost.slug}`}>Read Full Article →</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {recent.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recent.map((post) => (
                  <article
                    key={post.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-sm"
                  >
                    <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-t-xl">
                      {post.cover_image ? (
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-navy to-brand-navy-light">
                          <span className="text-5xl" aria-hidden>
                            🍁
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <p className="text-xs text-gray-500">{formatBlogDate(post.published_at)}</p>
                      <h3 className="line-clamp-2 font-bold text-brand-navy">{post.title}</h3>
                      {post.excerpt ? (
                        <p className="line-clamp-2 flex-1 text-sm text-gray-600">{post.excerpt}</p>
                      ) : null}
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-sm font-semibold text-brand-red hover:text-brand-red-dark"
                      >
                        Read More →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="bg-brand-red py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Pass Your Citizenship Test?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">
            Join thousands of Canadians who prepared with CitizenReady
          </p>
          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-full border-2 border-white bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href="/signup">Start Free Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-navy text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-4 font-semibold text-white">About</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/" className="hover:text-white">
                    CitizenReady
                  </Link>
                </li>
                <li>
                  <a href="#how-to-prepare" className="hover:text-white">
                    How it works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Practice</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/signup" className="hover:text-white">
                    Start practicing
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white">
                    Mock exam
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a
                    href="https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada.html"
                    className="hover:text-white"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Discover Canada
                  </a>
                </li>
                <li>
                  <a href="#topics" className="hover:text-white">
                    Chapters
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Support</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="/login" className="hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-white">
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-300">
            © 2026 CitizenReady. Proudly Canadian 🍁
          </div>
        </div>
      </footer>
    </div>
  )
}
