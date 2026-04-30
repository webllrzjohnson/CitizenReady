import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Library } from 'lucide-react'
import type { Topic } from '@/types'
import { STUDY_SHEETS } from '@/lib/study/study-sheets-meta'

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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to CitizenReady</h1>
          <p className="text-muted-foreground">
            Continue your Canadian citizenship exam preparation
          </p>
        </div>

        <Card className="border-brand-red/20 bg-amber-50/50">
          <CardHeader>
            <CardTitle>Sign up to track your progress and scores</CardTitle>
            <CardDescription>
              Create a free account to save practice results, mock exams, and see your improvement over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-brand-red text-white hover:bg-brand-red-dark">
              <Link href="/signup">Sign Up Free</Link>
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Study for your exam</h2>
          <Card className="overflow-hidden border-brand-navy/10 shadow-sm">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-white">
                <Library className="h-5 w-5" aria-hidden />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">Study centre</CardTitle>
                <CardDescription>
                  Timelines, holidays, government basics, symbols, capitals, key figures, and rights — build on IRCC&apos;s Discover Canada.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">Practice by Topic</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(topics as Topic[] | null)?.map((topic: Topic) => {
              const questionCount = countMap[topic.id] || 0

              return (
                <Card key={topic.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{topic.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {topic.description || 'Start practicing questions for this topic'}
                    </CardDescription>
                    <div className="pt-2 text-sm text-muted-foreground">
                      {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/practice/${topic.slug}`}>Start Practice</Link>
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single<{ full_name: string | null }>()

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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Study for your exam</h2>
        <Card className="overflow-hidden border-brand-navy/10 shadow-sm">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-white">
              <Library className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">Study centre</CardTitle>
              <CardDescription>
                Timelines, holidays, government basics, symbols, capitals, key figures, and rights — build on IRCC&apos;s Discover Canada.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">Practice by Topic</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(topics as Topic[] | null)?.map((topic: Topic) => {
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
                  <div className="space-y-1 pt-2 text-sm">
                    <div className="text-muted-foreground">
                      {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                    </div>
                    {bestScorePercent !== null && (
                      <div className="font-medium text-foreground">Best: {bestScorePercent}%</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/practice/${topic.slug}`}>Start Practice</Link>
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
