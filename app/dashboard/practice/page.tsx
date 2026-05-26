import { getSession } from '@/lib/auth/session'
import sql from '@/lib/db'
import { TopicCard } from '@/components/topics/TopicCard'
import { StudyPageHero } from '@/components/study/StudyPageHero'
import { BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Practice by Topic',
  description: 'Practice Canadian citizenship exam questions by topic.',
}

export default async function PracticePage() {
  const session = await getSession()

  const topics = await sql`SELECT * FROM public.topics ORDER BY sort_order ASC`

  const qRows = await sql`SELECT topic_id FROM public.questions WHERE is_active = true`
  const countMap: Record<string, number> = {}
  qRows.forEach((row: any) => {
    if (row.topic_id) countMap[row.topic_id] = (countMap[row.topic_id] ?? 0) + 1
  })

  const scoreMap: Record<string, { score: number; total: number }> = {}
  if (session) {
    const bestScores = await sql`
      SELECT topic_id, score, total_q FROM public.quiz_sessions
      WHERE user_id = ${session.id}::uuid AND type = 'practice' AND completed_at IS NOT NULL
    `
    bestScores.forEach((s: any) => {
      if (s.topic_id && s.score !== null) {
        if (!scoreMap[s.topic_id] || s.score > scoreMap[s.topic_id].score) {
          scoreMap[s.topic_id] = { score: s.score, total: s.total_q }
        }
      }
    })
  }

  const topicsWithStats = topics.map((topic: any) => ({
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
        {topicsWithStats.map((topic: any) => (
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