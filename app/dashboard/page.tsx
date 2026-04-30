import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Topic } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single<{ full_name: string | null }>()

  // Fetch session count
  const { count: sessionCount } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)

  // Average score calculation
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('score, total_q')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .not('score', 'is', null)

  const typedSessions = sessions as Array<{ score: number; total_q: number }> | null
  const avgScore = typedSessions?.length
    ? Math.round(
        typedSessions.reduce((sum, s) => sum + (s.score / s.total_q * 100), 0) 
        / typedSessions.length
      )
    : 0

  // Question counts via RPC
  const { data: questionCounts } = await supabase
    .rpc('get_question_counts_by_topic')

  const countMap: Record<string, number> = {};
  (questionCounts as Array<{ topic_id: string; count: number }> | null)?.forEach((row: { topic_id: string, count: number }) => {
    countMap[row.topic_id] = Number(row.count)
  })

  // Best scores per topic
  const { data: bestScores } = await supabase
    .from('quiz_sessions')
    .select('topic_id, score, total_q')
    .eq('user_id', user.id)
    .eq('type', 'practice')
    .not('completed_at', 'is', null)

  const scoreMap: Record<string, { score: number, total: number }> = {};
  (bestScores as Array<{ topic_id: string | null; score: number | null; total_q: number }> | null)?.forEach(s => {
    if (s.topic_id && s.score !== null) {
      if (!scoreMap[s.topic_id] || s.score > scoreMap[s.topic_id].score) {
        scoreMap[s.topic_id] = { score: s.score, total: s.total_q }
      }
    }
  })

  // Fetch all topics
  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .order('sort_order')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-muted-foreground">
          Continue your Canadian citizenship exam preparation
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{sessionCount ?? 0}</CardTitle>
            <CardDescription>Total Sessions</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{avgScore}%</CardTitle>
            <CardDescription>Average Score</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">0</CardTitle>
            <CardDescription>Mock Exams Passed</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Topic Cards */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Practice by Topic</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topics?.map((topic: Topic) => {
            const questionCount = countMap[topic.id] || 0
            const bestScore = scoreMap[topic.id]
            const bestScorePercent = bestScore 
              ? Math.round((bestScore.score / bestScore.total) * 100)
              : null

            return (
              <Card key={topic.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{topic.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {topic.description || 'Start practicing questions for this topic'}
                  </CardDescription>
                  <div className="pt-2 text-sm space-y-1">
                    <div className="text-muted-foreground">
                      {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                    </div>
                    {bestScorePercent !== null && (
                      <div className="font-medium text-foreground">
                        Best: {bestScorePercent}%
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/practice/${topic.slug}`}>
                      Start Practice
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

