import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ScoreChart from '@/components/progress/ScoreChart'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import {
  BookOpen,
  HelpCircle,
  Target,
  Trophy,
  Lock,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database.types'

export const metadata = {
  title: 'My Progress',
  description: 'Track your Canadian citizenship exam preparation progress.',
}

type Topic = Tables<'topics'>

interface TopicProgress {
  topic_id: string
  topic_name: string
  best_score: number | null
  sessions_count: number
  last_attempted: string | null
}

const STATUS_CONFIG = {
  strong:    { label: 'Strong',     variant: 'default'     as const, bar: 'bg-green-500' },
  improving: { label: 'Improving',  variant: 'secondary'   as const, bar: 'bg-amber-400' },
  needsWork: { label: 'Needs Work', variant: 'destructive' as const, bar: 'bg-brand-red'  },
  notStarted:{ label: 'Not Started',variant: 'outline'     as const, bar: 'bg-gray-200'  },
}

function getStatus(score: number | null) {
  if (score === null) return STATUS_CONFIG.notStarted
  if (score >= 8)    return STATUS_CONFIG.strong
  if (score >= 6)    return STATUS_CONFIG.improving
  return STATUS_CONFIG.needsWork
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 px-4 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <Lock className="h-10 w-10 text-muted-foreground" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Track Your Progress</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Sign up free to see your score history, topic breakdown, and improvement over time.
          </p>
        </div>
        <Button asChild className="bg-brand-red text-white hover:bg-brand-red-dark" size="lg">
          <Link href="/signup">Sign Up Free</Link>
        </Button>
        <Link href="/login" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Already have an account? Log in
        </Link>
      </div>
    )
  }

  // ── Data fetching ───────────────────────────────────────────
  const { count: totalSessions } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)

  const { data: userSessions } = await supabase
    .from('quiz_sessions')
    .select('id')
    .eq('user_id', user.id)

  const sessionIds = (userSessions as Array<{ id: string }> | null)?.map(s => s.id) || []

  const { count: totalQuestions } = await supabase
    .from('question_attempts')
    .select('session_id', { count: 'exact', head: true })
    .in('session_id', sessionIds)

  const { count: correctAnswers } = await supabase
    .from('question_attempts')
    .select('session_id', { count: 'exact', head: true })
    .eq('is_correct', true)
    .in('session_id', sessionIds)

  const overallAccuracy = totalQuestions && totalQuestions > 0
    ? Math.round((correctAnswers || 0) / totalQuestions * 100)
    : 0

  const { count: mockExamsPassed } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('type', 'mock_exam')
    .gte('score', 15)
    .not('completed_at', 'is', null)

  const { count: mockExamsTotal } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('type', 'mock_exam')
    .not('completed_at', 'is', null)

  const { data: mockExamScores } = await supabase
    .from('quiz_sessions')
    .select('score, total_q, completed_at')
    .eq('user_id', user.id)
    .eq('type', 'mock_exam')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(10)

  const { data: allTopics } = await supabase
    .from('topics')
    .select('id, name')
    .order('sort_order')

  const { data: practiceSessions } = await supabase
    .from('quiz_sessions')
    .select('topic_id, score, total_q, completed_at')
    .eq('user_id', user.id)
    .eq('type', 'practice')
    .not('completed_at', 'is', null)
    .not('topic_id', 'is', null)

  const topicProgressMap: Record<string, TopicProgress> = {};
  (allTopics as Array<{ id: string; name: string }> | null)?.forEach((topic) => {
    topicProgressMap[topic.id] = {
      topic_id: topic.id,
      topic_name: topic.name,
      best_score: null,
      sessions_count: 0,
      last_attempted: null,
    }
  });

  (practiceSessions as Array<{ topic_id: string | null; score: number | null; completed_at: string }> | null)
    ?.forEach((session) => {
      if (!session.topic_id) return
      const progress = topicProgressMap[session.topic_id]
      if (!progress) return
      progress.sessions_count++
      if (session.score !== null && (progress.best_score === null || session.score > progress.best_score)) {
        progress.best_score = session.score
      }
      if (!progress.last_attempted || session.completed_at > progress.last_attempted) {
        progress.last_attempted = session.completed_at
      }
    })

  const topicProgressArray = Object.values(topicProgressMap).sort((a, b) => {
    if (a.best_score === null && b.best_score === null) return 0
    if (a.best_score === null) return 1
    if (b.best_score === null) return -1
    return b.best_score - a.best_score
  })

  const accuracyColor =
    overallAccuracy >= 80 ? 'text-green-600' :
    overallAccuracy >= 60 ? 'text-amber-600' :
    'text-brand-red'

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">

      {/* ── Page header ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-navy via-[#1a2a4a] to-[#0f1e35] p-8 text-white shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(211,47,47,0.18),transparent_60%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10 backdrop-blur">
            <TrendingUp className="h-7 w-7 text-brand-red-light" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Dashboard</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Progress
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              Your study history, score trends, and topic-by-topic breakdown — all in one place.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-navy/8">
            <BookOpen className="h-6 w-6 text-brand-navy" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{totalSessions ?? 0}</p>
            <p className="text-sm text-gray-500">Sessions</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <HelpCircle className="h-6 w-6 text-blue-600" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{totalQuestions ?? 0}</p>
            <p className="text-sm text-gray-500">Questions answered</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            overallAccuracy >= 80 ? 'bg-green-50' : overallAccuracy >= 60 ? 'bg-amber-50' : 'bg-red-50'
          )}>
            <Target className={cn('h-6 w-6', accuracyColor)} aria-hidden />
          </div>
          <div>
            <p className={cn('text-2xl font-extrabold', accuracyColor)}>{overallAccuracy}%</p>
            <p className="text-sm text-gray-500">Overall accuracy</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <Trophy className="h-6 w-6 text-amber-500" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">
              {mockExamsPassed ?? 0}
              <span className="text-base font-normal text-gray-400"> / {mockExamsTotal ?? 0}</span>
            </p>
            <p className="text-sm text-gray-500">Mock exams passed</p>
          </div>
        </div>
      </div>

      {/* ── Score chart ───────────────────────────────────────── */}
      <ScoreChart scores={mockExamScores || []} />

      {/* ── Topic breakdown ───────────────────────────────────── */}
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
                  <tr
                    key={progress.topic_id}
                    className={cn(
                      'border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60',
                      progress.best_score === null && 'opacity-60'
                    )}
                  >
                    <td className="px-6 py-3.5 text-sm font-medium text-gray-900">
                      {progress.topic_name}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-gray-800">
                          {progress.best_score !== null ? `${progress.best_score}/10` : '—'}
                        </p>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn('h-full rounded-full transition-all', status.bar)}
                            style={{ width: progress.best_score !== null ? `${progress.best_score * 10}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{progress.sessions_count}</td>
                    <td className="hidden px-4 py-3.5 text-sm text-gray-400 sm:table-cell">
                      {progress.last_attempted
                        ? formatDistanceToNow(new Date(progress.last_attempted), { addSuffix: true })
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
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
