import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { TopicCard } from '@/components/topics/TopicCard'
import { redirect } from 'next/navigation'
import type { Topic } from '@/types'

export const metadata = {
  title: 'Practice by Topic',
  description: 'Practice Canadian citizenship exam questions by topic.',
}

interface TopicWithStats extends Topic {
  question_count: number
  best_score: number | null
  best_total: number | null
}

export default async function PracticePage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch topics
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('*')
    .order('name')

  console.log('topics:', topics)
  console.log('topics error:', topicsError)

  // Fetch question counts per topic using RPC (bypasses RLS)
  const { data: questionCounts } = await supabase
    .rpc('get_question_counts_by_topic')

  // Build count map from RPC results
  const countMap: Record<string, number> = {};
  (questionCounts as Array<{ topic_id: string; count: number }> | null)?.forEach((row: { topic_id: string, count: number }) => {
    countMap[row.topic_id] = row.count
  })

  // Fetch best scores per topic for this user
  const { data: bestScores } = await supabase
    .from('quiz_sessions')
    .select('topic_id, score, total_q')
    .eq('user_id', user?.id ?? '')
    .eq('type', 'practice')
    .not('completed_at', 'is', null)

  // Build best score map
  const scoreMap: Record<string, { score: number, total: number }> = {};
  (bestScores as Array<{ topic_id: string | null; score: number | null; total_q: number }> | null)?.forEach(s => {
    if (s.topic_id && s.score !== null) {
      if (!scoreMap[s.topic_id] || s.score > scoreMap[s.topic_id].score) {
        scoreMap[s.topic_id] = { score: s.score, total: s.total_q }
      }
    }
  })

  const topicsWithStats = ((topics as any[]) || []).map((topic: any) => ({
    ...topic,
    question_count: countMap[topic.id] ?? 0,
    best_score: scoreMap[topic.id]?.score ?? null,
    best_total: scoreMap[topic.id]?.total ?? null,
  }))

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice by Topic</h1>
        <p className="text-muted-foreground">
          Choose a topic to practice. Each session contains 10 random questions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topicsWithStats.map((topic) => (
          <TopicCard
            key={topic.id}
            id={topic.id}
            name={topic.name}
            description={topic.description}
            slug={topic.slug}
            questionCount={topic.question_count}
            bestScore={topic.best_score}
            bestTotal={topic.best_total}
          />
        ))}
      </div>

      {topicsWithStats.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No topics available yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
