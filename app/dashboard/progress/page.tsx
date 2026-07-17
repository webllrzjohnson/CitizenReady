import { getSession } from '@/lib/auth/session'
import sql from '@/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ScoreChart from '@/components/progress/ScoreChart'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { BookOpen, HelpCircle, Target, Trophy, Lock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildWeakTopicRecommendations, formatIncorrectReviewSummary } from '@/lib/progress-insights'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Progress',
  description: 'Track your Canadian citizenship exam preparation progress.',
}

const STATUS_CONFIG = {
  strong:     { label: 'Strong',      variant: 'default'     as const, bar: 'bg-green-500' },
  improving:  { label: 'Improving',   variant: 'secondary'   as const, bar: 'bg-amber-400' },
  needsWork:  { label: 'Needs Work',  variant: 'destructive' as const, bar: 'bg-brand-red'  },
  notStarted: { label: 'Not Started', variant: 'outline'     as const, bar: 'bg-gray-200'  },
}

function getStatus(score: number | null) {
  if (score === null) return STATUS_CONFIG.notStarted
  if (score >= 8) return STATUS_CONFIG.strong
  if (score >= 6) return STATUS_CONFIG.improving
  return STATUS_CONFIG.needsWork
}

export default async function ProgressPage() {
  const session = await getSession()

  if (!session) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 px-4 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <Lock className="h-10 w-10 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Track Your Progress</h1>
          <p className="mx-auto max-w-md text-muted-foreground">Sign up free to see your score history, topic breakdown, and improvement over time.</p>
        </div>
        <Button asChild className="bg-brand-red text-white hover:bg-brand-red-dark" size="lg">
          <Link href="/signup">Sign Up Free</Link>
        </Button>
        <Link href="/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">Already have an account? Log in</Link>
      </div>
    )
  }

  const [
    totalSessionsRows,
    userSessionRows,
    mockExamsPassedRows,
    mockExamsTotalRows,
    mockExamScores,
    allTopics,
    practiceSessions,
  ] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM public.quiz_sessions WHERE user_id = ${session.id}::uuid AND completed_at IS NOT NULL`,
    sql`SELECT id FROM public.quiz_sessions WHERE user_id = ${session.id}::uuid`,
    sql`SELECT COUNT(*) as count FROM public.quiz_sessions WHERE user_id = ${session.id}::uuid AND type = 'mock_exam' AND score >= 15 AND completed_at IS NOT NULL`,
    sql`SELECT COUNT(*) as count FROM public.quiz_sessions WHERE user_id = ${session.id}::uuid AND type = 'mock_exam' AND completed_at IS NOT NULL`,
    sql`SELECT score, total_q, completed_at FROM public.quiz_sessions WHERE user_id = ${session.id}::uuid AND type = 'mock_exam' AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 10`,
    sql`SELECT id, name, slug FROM public.topics ORDER BY sort_order`,
    sql`SELECT topic_id, score, total_q, completed_at FROM public.quiz_sessions WHERE user_id = ${session.id}::uuid AND type = 'practice' AND completed_at IS NOT NULL AND topic_id IS NOT NULL`,
  ])

  const totalSessions = parseInt(totalSessionsRows[0]?.count ?? '0')
  const mockExamsPassed = parseInt(mockExamsPassedRows[0]?.count ?? '0')
  const mockExamsTotal = parseInt(mockExamsTotalRows[0]?.count ?? '0')
  const sessionIds = userSessionRows.map((s: any) => s.id)

  let totalQuestions = 0
  let correctAnswers = 0
  let recentIncorrect: any[] = []
  if (sessionIds.length > 0) {
    const [tqRows, caRows, incorrectRows] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM public.question_attempts WHERE session_id = ANY(${sql.array(sessionIds)}::uuid[])`,
      sql`SELECT COUNT(*) as count FROM public.question_attempts WHERE is_correct = true AND session_id = ANY(${sql.array(sessionIds)}::uuid[])`,
      sql`
        SELECT qa.id, qa.user_answer, qa.created_at,
               q.question_text, q.correct_answers, q.options, q.explanation,
               t.name AS topic_name, t.slug AS topic_slug
        FROM public.question_attempts qa
        JOIN public.questions q ON q.id = qa.question_id
        JOIN public.topics t ON t.id = q.topic_id
        WHERE qa.is_correct = false AND qa.session_id = ANY(${sql.array(sessionIds)}::uuid[])
        ORDER BY qa.created_at DESC
        LIMIT 5
      `,
    ])
    totalQuestions = parseInt(tqRows[0]?.count ?? '0')
    correctAnswers = parseInt(caRows[0]?.count ?? '0')
    recentIncorrect = incorrectRows
  }

  const overallAccuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  const topicProgressMap: Record<string, { topic_id: string; topic_name: string; topic_slug: string; best_score: number | null; sessions_count: number; last_attempted: string | null }> = {}
  allTopics.forEach((topic: any) => {
    topicProgressMap[topic.id] = { topic_id: topic.id, topic_name: topic.name, topic_slug: topic.slug, best_score: null, sessions_count: 0, last_attempted: null }
  })
  practiceSessions.forEach((s: any) => {
    if (!s.topic_id) return
    const progress = topicProgressMap[s.topic_id]
    if (!progress) return
    progress.sessions_count++
    if (s.score !== null && (progress.best_score === null || s.score > progress.best_score)) progress.best_score = s.score
    if (!progress.last_attempted || s.completed_at > progress.last_attempted) progress.last_attempted = s.completed_at
  })

  const topicProgressArray = Object.values(topicProgressMap).sort((a, b) => {
    if (a.best_score === null && b.best_score === null) return 0
    if (a.best_score === null) return 1
    if (b.best_score === null) return -1
    return b.best_score - a.best_score
  })
  const weakTopicRecommendations = buildWeakTopicRecommendations(topicProgressArray, 3)

  const accuracyColor = overallAccuracy >= 80 ? 'text-green-600' : overallAccuracy >= 60 ? 'text-amber-600' : 'text-brand-red'

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-[#1a2a4a] to-[#0f1e35] p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(211,47,47,0.18),transparent_60%)]" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 backdrop-blur">
            <TrendingUp className="h-7 w-7 text-brand-red-light" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Dashboard</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Progress</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">Your study history, score trends, and topic-by-topic breakdown — all in one place.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy/8">
            <BookOpen className="h-6 w-6 text-brand-navy" aria-hidden />
          </div>
          <div><p className="text-2xl font-extrabold text-gray-900">{totalSessions}</p><p className="text-sm text-gray-500">Sessions</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <HelpCircle className="h-6 w-6 text-blue-600" aria-hidden />
          </div>
          <div><p className="text-2xl font-extrabold text-gray-900">{totalQuestions}</p><p className="text-sm text-gray-500">Questions answered</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', overallAccuracy >= 80 ? 'bg-green-50' : overallAccuracy >= 60 ? 'bg-amber-50' : 'bg-red-50')}>
            <Target className={cn('h-6 w-6', accuracyColor)} aria-hidden />
          </div>
          <div><p className={cn('text-2xl font-extrabold', accuracyColor)}>{overallAccuracy}%</p><p className="text-sm text-gray-500">Overall accuracy</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <Trophy className="h-6 w-6 text-amber-500" aria-hidden />
          </div>
          <div><p className="text-2xl font-extrabold text-gray-900">{mockExamsPassed}<span className="text-base font-normal text-gray-400"> / {mockExamsTotal}</span></p><p className="text-sm text-gray-500">Mock exams passed</p></div>
        </div>
      </div>

      <ScoreChart scores={mockExamScores as any[] || []} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">Recommended focus</p>
              <p className="mt-0.5 text-sm text-gray-500">Weak topics to review next</p>
            </div>
            <Badge variant="secondary">Smart review</Badge>
          </div>
          {weakTopicRecommendations.length > 0 ? (
            <div className="space-y-3">
              {weakTopicRecommendations.map((topic) => (
                <Link
                  key={topic.topic_id}
                  href={`/dashboard/practice/${topic.topic_slug}`}
                  className="block rounded-xl border border-gray-100 p-4 transition-colors hover:border-brand-red/40 hover:bg-red-50/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{topic.topic_name}</p>
                      <p className="mt-1 text-sm text-gray-500">{topic.reason}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-brand-red">
                      {topic.best_score === null ? 'Start' : `${topic.best_score}/10`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
              Nice work — no weak topics stand out yet. Keep practicing to build more history.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">Review missed questions</p>
              <p className="mt-0.5 text-sm text-gray-500">Your latest incorrect answers</p>
            </div>
            <Badge variant="outline">Last 5</Badge>
          </div>
          {recentIncorrect.length > 0 ? (
            <div className="space-y-3">
              {recentIncorrect.map((attempt) => {
                const options = typeof attempt.options === 'string' ? JSON.parse(attempt.options) : attempt.options
                const correctAnswers = typeof attempt.correct_answers === 'string' ? JSON.parse(attempt.correct_answers) : attempt.correct_answers
                return (
                  <div key={attempt.id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="destructive">Incorrect</Badge>
                      <Link href={`/dashboard/practice/${attempt.topic_slug}`} className="text-xs font-semibold text-brand-navy hover:underline">
                        {attempt.topic_name}
                      </Link>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-gray-900">{attempt.question_text}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {formatIncorrectReviewSummary({ correct_answers: correctAnswers ?? [], options: options ?? [] })}
                    </p>
                    {attempt.explanation && (
                      <p className="mt-2 line-clamp-2 text-xs text-blue-700">{attempt.explanation}</p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-800">
              No missed questions yet. Complete practice or mock exams to build a review queue.
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-lg font-semibold text-gray-900">Topic breakdown</p>
          <p className="mt-0.5 text-sm text-gray-500">Your best score and session count per topic</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Topic</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Best score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Sessions</th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 sm:table-cell">Last practiced</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {topicProgressArray.map((progress) => {
                const status = getStatus(progress.best_score)
                return (
                  <tr key={progress.topic_id} className={cn('border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60', progress.best_score === null && 'opacity-60')}>
                    <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{progress.topic_name}</td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-gray-800">{progress.best_score !== null ? `${progress.best_score}/10` : '—'}</p>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div className={cn('h-full rounded-full transition-all', status.bar)} style={{ width: progress.best_score !== null ? `${progress.best_score * 10}%` : '0%' }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{progress.sessions_count}</td>
                    <td className="hidden px-4 py-3.5 text-sm text-gray-400 sm:table-cell">{progress.last_attempted ? formatDistanceToNow(new Date(progress.last_attempted), { addSuffix: true }) : 'Never'}</td>
                    <td className="px-4 py-3.5"><Badge variant={status.variant}>{status.label}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}