import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Library, BookOpen, FileText, TrendingUp, ArrowRight } from 'lucide-react'
import type { Topic } from '@/types'
import { STUDY_SHEETS } from '@/lib/study/study-sheets-meta'
import { getTopicIcon } from '@/lib/topics/topic-icons'
import { cn } from '@/lib/utils'
import { UpgradeBanner } from '@/components/marketing/UpgradeBanner'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .order('sort_order')

  let countMap: Record<string, number> = {}
  if (user) {
    const { data: questionCounts } = await supabase.rpc('get_question_counts_by_topic')
    ;(questionCounts as Array<{ topic_id: string; count: number }> | null)?.forEach(
      (row: { topic_id: string; count: number }) => {
        countMap[row.topic_id] = Number(row.count)
      }
    )
  } else {
    const { data: qRows } = await supabase
      .from('questions')
      .select('topic_id')
      .eq('is_active', true)
    ;(qRows as Array<{ topic_id: string | null }> | null)?.forEach((row) => {
      if (row.topic_id) {
        countMap[row.topic_id] = (countMap[row.topic_id] ?? 0) + 1
      }
    })
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome to CitizenReady
          </h1>
          <p className="mt-1 text-gray-500">
            Continue your Canadian citizenship exam preparation
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Sign up to track your progress and scores</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a free account to save practice results, mock exams, and see your improvement over time.
          </p>
          <Button asChild className="mt-4 bg-brand-red text-white hover:bg-brand-red-dark">
            <Link href="/signup">Sign Up Free</Link>
          </Button>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Study for your exam</h2>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-row items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
                <Library className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-lg font-semibold text-gray-900">Study centre</p>
                <p className="text-sm text-gray-500">
                  Timelines, holidays, government basics, symbols, capitals, key figures, and rights — built on IRCC&apos;s Discover Canada.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3 pl-[3.75rem]">
              <Button asChild className="bg-brand-navy text-white hover:bg-brand-navy-light">
                <Link href="/dashboard/study">Open study centre</Link>
              </Button>
              <div className="flex flex-wrap gap-2">
                {STUDY_SHEETS.map((sheet) => (
                  <Button key={sheet.href} variant="secondary" size="sm" className="text-xs sm:text-sm" asChild>
                    <Link href={sheet.href}>{sheet.title}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Practice by topic</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(topics as Topic[] | null)?.map((topic: Topic) => {
              const questionCount = countMap[topic.id] || 0
              const { icon, bg } = getTopicIcon(topic.slug)
              return (
                <div key={topic.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg', bg)}>
                      <span role="img" aria-hidden>{icon}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{topic.name}</p>
                  </div>
                  <p className="line-clamp-2 text-sm text-gray-500">
                    {topic.description || 'Start practicing questions for this topic'}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                  </p>
                  <Button asChild className="mt-4 w-full bg-brand-red hover:bg-brand-red-dark">
                    <Link href={`/dashboard/practice/${topic.slug}`}>Start Practice</Link>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_premium, role')
    .eq('id', user.id)
    .single<{ full_name: string | null; is_premium: boolean | null; role: string | null }>()

  const isPremium = profile?.role === 'admin' || profile?.is_premium === true

  const { count: sessionCount } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('score, total_q')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .not('score', 'is', null)

  const typedSessions = sessions as Array<{ score: number; total_q: number }> | null
  const avgScore = typedSessions?.length
    ? Math.round(
        typedSessions.reduce((sum, s) => sum + (s.score / s.total_q) * 100, 0) /
          typedSessions.length
      )
    : 0

  const { data: bestScores } = await supabase
    .from('quiz_sessions')
    .select('topic_id, score, total_q')
    .eq('user_id', user.id)
    .eq('type', 'practice')
    .not('completed_at', 'is', null)

  const scoreMap: Record<string, { score: number; total: number }> = {}
  ;(bestScores as Array<{ topic_id: string | null; score: number | null; total_q: number }> | null)?.forEach(
    (s) => {
      if (s.topic_id && s.score !== null) {
        if (!scoreMap[s.topic_id] || s.score > scoreMap[s.topic_id].score) {
          scoreMap[s.topic_id] = { score: s.score, total: s.total_q }
        }
      }
    }
  )

  const quickLinks = [
    { href: '/dashboard/practice', label: 'Practice', icon: BookOpen, desc: 'Topic-by-topic questions' },
    { href: '/dashboard/mock-exam', label: 'Mock Exam', icon: FileText, desc: '20 q · 30 min timer' },
    { href: '/dashboard/progress', label: 'Progress', icon: TrendingUp, desc: 'Score history & trends' },
    { href: '/dashboard/study', label: 'Study centre', icon: Library, desc: 'Study sheets & handbook' },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="mt-1 text-gray-500">Continue your Canadian citizenship exam preparation</p>
      </div>

      {/* Upgrade nudge for free users */}
      {!isPremium && <UpgradeBanner />}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-gray-900">{sessionCount ?? 0}</p>
          <p className="mt-1 text-sm text-gray-500">Total sessions</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-gray-900">{avgScore}%</p>
          <p className="mt-1 text-sm text-gray-500">Average score</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-gray-900">0</p>
          <p className="mt-1 text-sm text-gray-500">Mock exams passed</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 transition-colors group-hover:text-brand-red">{label}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-brand-red" aria-hidden />
          </Link>
        ))}
      </div>

      {/* Practice by topic */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Practice by topic</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(topics as Topic[] | null)?.map((topic: Topic) => {
            const questionCount = countMap[topic.id] || 0
            const bestScore = scoreMap[topic.id]
            const bestScorePercent = bestScore
              ? Math.round((bestScore.score / bestScore.total) * 100)
              : null
            const { icon, bg } = getTopicIcon(topic.slug)

            return (
              <div key={topic.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg', bg)}>
                    <span role="img" aria-hidden>{icon}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{topic.name}</p>
                </div>
                <p className="line-clamp-2 text-sm text-gray-500">
                  {topic.description || 'Start practicing questions for this topic'}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span>{questionCount} {questionCount === 1 ? 'question' : 'questions'}</span>
                  {bestScorePercent !== null && (
                    <span className="font-semibold text-green-600">Best: {bestScorePercent}%</span>
                  )}
                </div>
                <Button asChild className="mt-4 w-full bg-brand-red hover:bg-brand-red-dark">
                  <Link href={`/dashboard/practice/${topic.slug}`}>Start Practice</Link>
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
