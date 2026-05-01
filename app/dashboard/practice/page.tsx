import { createClient } from '@/lib/supabase/server'
import { TopicCard } from '@/components/topics/TopicCard'
import { StudyPageHero } from '@/components/study/StudyPageHero'
import { BookOpen } from 'lucide-react'
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
  const { data: { user } } = await supabase.auth.getUser()

  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('*')
    .order('sort_order', { ascending: true })


  console.log('topics:', topics)
  console.log('topics error:', topicsError)

  const countMap: Record<string, number> = {}

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

  const scoreMap: Record<string, { score: number; total: number }> = {}
  if (user) {
    const { data: bestScores } = await supabase
      .from('quiz_sessions')
      .select('topic_id, score, total_q')
      .eq('user_id', user.id)
      .eq('type', 'practice')
      .not('completed_at', 'is', null)

    ;(bestScores as Array<{ topic_id: string | null; score: number | null; total_q: number }> | null)?.forEach(
      (s) => {
        if (s.topic_id && s.score !== null) {
          if (!scoreMap[s.topic_id] || s.score > scoreMap[s.topic_id].score) {
            scoreMap[s.topic_id] = { score: s.score, total: s.total_q }
          }
        }
      }
    )
  }

  const topicsWithStats = ((topics as any[]) || []).map((topic: any) => ({
    ...topic,
    question_count: countMap[topic.id] ?? 0,
    best_score: scoreMap[topic.id]?.score ?? null,
    best_total: scoreMap[topic.id]?.total ?? null,
  }))

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <StudyPageHero
        icon={BookOpen}
        eyebrow="Practice"
        title="Practice by topic"
        description="Choose a chapter to practice. Each session draws 10 random questions — work through topics until each one shows a strong best score."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
            sortOrder={topic.sort_order ?? 0}
          />
        ))}
      </div>

      {topicsWithStats.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white py-12 text-center shadow-sm">
          <p className="text-gray-400">No topics available yet.</p>
        </div>
      )}
    </div>
  )
}
