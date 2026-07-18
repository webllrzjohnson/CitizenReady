import { getSession } from '@/lib/auth/session'
import sql from '@/lib/db'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Library, BookOpen, FileText, TrendingUp, ArrowRight } from 'lucide-react'
import type { Topic } from '@/types'
import { STUDY_SHEETS } from '@/lib/study/study-sheets-meta'
import { getTopicIcon } from '@/lib/topics/topic-icons'
import { cn } from '@/lib/utils'
import { UpgradeBanner } from '@/components/marketing/UpgradeBanner'
import { hasPremiumAccess } from '@/lib/premium'
import { PlusStatusCard } from '@/components/dashboard/PlusStatusCard'
import { TodayStudyPlanCard } from '@/components/dashboard/TodayStudyPlanCard'
import { LearnerRetentionCard } from '@/components/dashboard/LearnerRetentionCard'
import { buildTodayStudyPlan, buildWeakTopicRecommendations } from '@/lib/progress-insights'
import { buildLearnerRetentionSummary } from '@/lib/learner-retention'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()

  const topics = await sql<Topic[]>`
    SELECT * FROM public.topics ORDER BY sort_order
  `

  let countMap: Record<string, number> = {}
  const qRows = await sql<{ topic_id: string }[]>`
    SELECT topic_id FROM public.questions WHERE is_active = true
  `
  qRows.forEach((row) => {
    if (row.topic_id) {
      countMap[row.topic_id] = (countMap[row.topic_id] ?? 0) + 1
    }
  })

  if (!session) {
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
            {topics.map((topic: Topic) => {
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

  const profileRows = await sql<{ full_name: string | null; is_premium: boolean; premium_expires_at: string | null; role: string }[]>`
    SELECT full_name, is_premium, premium_expires_at, role FROM public.profiles WHERE id = ${session.id}::uuid LIMIT 1
  `
  const profile = profileRows[0] ?? null
  const isPremium = hasPremiumAccess(profile)

  const sessionCountRows = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM public.quiz_sessions
    WHERE user_id = ${session.id}::uuid AND completed_at IS NOT NULL
  `
  const sessionCount = parseInt(sessionCountRows[0]?.count ?? '0')

  const sessions = await sql<{ score: number; total_q: number }[]>`
    SELECT score, total_q FROM public.quiz_sessions
    WHERE user_id = ${session.id}::uuid AND completed_at IS NOT NULL AND score IS NOT NULL
  `
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.score / s.total_q) * 100, 0) / sessions.length)
    : 0

  const bestScores = await sql<{ topic_id: string; score: number; total_q: number; completed_at: string | null }[]>`
    SELECT topic_id, score, total_q, completed_at FROM public.quiz_sessions
    WHERE user_id = ${session.id}::uuid AND type = 'practice' AND completed_at IS NOT NULL
  `
  const scoreMap: Record<string, { score: number; total: number }> = {}
  const topicProgressMap: Record<string, { topic_id: string; topic_name: string; topic_slug: string; best_score: number | null; sessions_count: number; last_attempted: string | null }> = {}
  topics.forEach((topic) => {
    topicProgressMap[topic.id] = { topic_id: topic.id, topic_name: topic.name, topic_slug: topic.slug, best_score: null, sessions_count: 0, last_attempted: null }
  })
  bestScores.forEach((s) => {
    if (s.topic_id && s.score !== null) {
      if (!scoreMap[s.topic_id] || s.score > scoreMap[s.topic_id].score) {
        scoreMap[s.topic_id] = { score: s.score, total: s.total_q }
      }
      const progress = topicProgressMap[s.topic_id]
      if (progress) {
        progress.sessions_count++
        if (progress.best_score === null || s.score > progress.best_score) progress.best_score = s.score
        if (!progress.last_attempted || (s.completed_at && s.completed_at > progress.last_attempted)) progress.last_attempted = s.completed_at
      }
    }
  })

  const missedQuestionRows = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count
    FROM public.question_attempts qa
    JOIN public.quiz_sessions qs ON qs.id = qa.session_id
    WHERE qs.user_id = ${session.id}::uuid AND qa.is_correct = false
  `
  const mockExamCountRows = await sql<{ count: string }[]>`
    SELECT COUNT(*) as count FROM public.quiz_sessions
    WHERE user_id = ${session.id}::uuid AND type = 'mock_exam' AND completed_at IS NOT NULL
  `
  const latestMockRows = await sql<{ score: number | null }[]>`
    SELECT score FROM public.quiz_sessions
    WHERE user_id = ${session.id}::uuid AND type = 'mock_exam' AND completed_at IS NOT NULL
    ORDER BY completed_at DESC
    LIMIT 1
  `
  const retentionRows = await sql<{ completed_at: string; type: string; topic_slug: string | null }[]>`
    SELECT qs.completed_at, qs.type, t.slug AS topic_slug
    FROM public.quiz_sessions qs
    LEFT JOIN public.topics t ON t.id = qs.topic_id
    WHERE qs.user_id = ${session.id}::uuid AND qs.completed_at IS NOT NULL
    ORDER BY qs.completed_at DESC
    LIMIT 30
  `
  const retentionSummary = buildLearnerRetentionSummary({ completedSessions: retentionRows })
  const todayStudyPlan = buildTodayStudyPlan({
    missedQuestionCount: parseInt(missedQuestionRows[0]?.count ?? '0'),
    weakTopics: buildWeakTopicRecommendations(Object.values(topicProgressMap), 1),
    mockExamCount: parseInt(mockExamCountRows[0]?.count ?? '0'),
    latestMockScore: latestMockRows[0]?.score ?? null,
  })

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

      {!isPremium && <UpgradeBanner />}

      <PlusStatusCard profile={profile} />

      <LearnerRetentionCard summary={retentionSummary} />

      <TodayStudyPlanCard items={todayStudyPlan} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-gray-900">{sessionCount}</p>
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

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Practice by topic</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic: Topic) => {
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