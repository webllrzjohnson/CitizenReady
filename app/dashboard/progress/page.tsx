import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ScoreChart from '@/components/progress/ScoreChart'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Lock } from 'lucide-react'
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

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 px-4 py-12 text-center">
        <Lock className="h-14 w-14 shrink-0 text-muted-foreground" aria-hidden />
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
          Login
        </Link>
      </div>
    )
  }

  // 1. Overall stats
  const { count: totalSessions } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)

  // Get user's session IDs first
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

  // 2. Recent mock exam scores
  const { data: mockExamScores } = await supabase
    .from('quiz_sessions')
    .select('score, total_q, completed_at')
    .eq('user_id', user.id)
    .eq('type', 'mock_exam')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(10)

  // 3. Topic breakdown
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

  (practiceSessions as Array<{ topic_id: string | null; score: number | null; completed_at: string }> | null)?.forEach((session) => {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        <p className="text-muted-foreground">
          Track your study history and performance over time
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{totalSessions ?? 0}</CardTitle>
            <CardDescription>Total Sessions</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{totalQuestions ?? 0}</CardTitle>
            <CardDescription>Questions Answered</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{overallAccuracy}%</CardTitle>
            <CardDescription>Overall Accuracy</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {mockExamsPassed ?? 0} / {mockExamsTotal ?? 0}
            </CardTitle>
            <CardDescription>Mock Exams Passed</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Mock Exam Score Chart */}
      <ScoreChart scores={mockExamScores || []} />

      {/* Topic Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Breakdown</CardTitle>
          <CardDescription>Your performance across all topics</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium">Topic</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Best Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Sessions</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Last Practiced</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {topicProgressArray.map((progress) => {
                const statusVariant = progress.best_score === null
                  ? 'outline'
                  : progress.best_score >= 8
                  ? 'default'
                  : progress.best_score >= 6
                  ? 'secondary'
                  : 'destructive'

                const statusText = progress.best_score === null
                  ? 'Not Started'
                  : progress.best_score >= 8
                  ? 'Strong'
                  : progress.best_score >= 6
                  ? 'Improving'
                  : 'Needs Work'

                return (
                  <tr key={progress.topic_id} className="border-b">
                    <td className="px-4 py-3 text-sm font-medium">
                      {progress.topic_name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {progress.best_score !== null ? `${progress.best_score}/10` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{progress.sessions_count}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {progress.last_attempted
                        ? formatDistanceToNow(new Date(progress.last_attempted), { addSuffix: true })
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant}>{statusText}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
