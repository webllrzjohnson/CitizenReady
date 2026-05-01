import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, Calendar, Target, Trophy, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExamResultActions } from '@/components/exam/ExamResultActions'
import { QuizOptionRow, type QuizOptionVisual } from '@/components/quiz/QuizOptionRow'

interface ExamResultsPageProps {
  params: Promise<{ sessionId: string }>
}

export default async function ExamResultsPage({ params }: ExamResultsPageProps) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessionData, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !sessionData) redirect('/dashboard/mock-exam')

  const session = sessionData as {
    id: string
    score: number | null
    total_q: number
    completed_at: string | null
    created_at: string
    question_ids: unknown
  }

  if (!session.completed_at) redirect(`/dashboard/mock-exam/${sessionId}`)

  const questionIds = session.question_ids as string[]

  const { data: attemptsData } = await supabase
    .from('question_attempts')
    .select(`
      *,
      questions:question_id (
        id,
        question_text,
        options,
        correct_answers,
        explanation,
        type
      )
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  const attempts = ((attemptsData as any[]) || []).map((attempt: any) => ({
    id: attempt.id,
    question_id: attempt.question_id,
    user_answer: attempt.user_answer as string[],
    is_correct: attempt.is_correct,
    question: Array.isArray(attempt.questions)
      ? attempt.questions[0]
      : attempt.questions,
  }))

  const orderedAttempts = questionIds
    .map((qid) => attempts.find((a) => a.question_id === qid))
    .filter(Boolean)

  const score = session.score ?? 0
  const total = session.total_q
  const percentage = Math.round((score / total) * 100)
  const passed = score >= 15

  const timeTaken =
    session.completed_at && session.created_at
      ? Math.round(
          (new Date(session.completed_at).getTime() - new Date(session.created_at).getTime()) /
            1000 /
            60
        )
      : 0

  const completedDate = session.completed_at
    ? new Date(session.completed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8">

      {/* ── Pass/Fail hero ────────────────────────────────────── */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl p-8 text-center shadow-xl',
          passed
            ? 'bg-gradient-to-br from-green-600 to-green-800'
            : 'bg-gradient-to-br from-brand-red to-brand-red-dark'
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_65%)]"
          aria-hidden
        />
        <div className="relative space-y-3">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
              {passed ? (
                <Trophy className="h-10 w-10 text-white" aria-hidden />
              ) : (
                <AlertCircle className="h-10 w-10 text-white" aria-hidden />
              )}
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
            {passed ? 'Congratulations' : 'Keep going'}
          </p>
          <p className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
            {score} / {total}
          </p>
          <p className="text-2xl font-bold text-white/90">{percentage}%</p>
          <p className="text-base text-white/80">
            {passed
              ? 'You passed the mock citizenship exam!'
              : 'You need 15/20 (75%) to pass. Keep practicing!'}
          </p>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            passed ? 'bg-green-50' : 'bg-red-50'
          )}>
            <Target className={cn('h-6 w-6', passed ? 'text-green-600' : 'text-brand-red')} aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{score}/{total}</p>
            <p className="text-sm text-gray-500">Your score</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <Clock className="h-6 w-6 text-blue-600" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{timeTaken} min</p>
            <p className="text-sm text-gray-500">Time taken</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
            <Calendar className="h-6 w-6 text-gray-600" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-gray-900">{completedDate}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
      </div>

      {/* ── Question review ───────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-lg font-semibold text-gray-900">Question review</p>
          <p className="mt-0.5 text-sm text-gray-500">
            Your answers and the correct responses with explanations
          </p>
        </div>

        <div className="divide-y divide-gray-100 px-6">
          {orderedAttempts.map((attempt, idx) => {
            if (!attempt || !attempt.question) return null

            const question = attempt.question as {
              id: string
              question_text: string
              options: { key: string; text: string }[]
              correct_answers: string[]
              explanation: string | null
              type: string
            }

            const userAnswer = attempt.user_answer
            const correctAnswers = question.correct_answers
            const isCorrect = attempt.is_correct

            return (
              <div key={attempt.id} className="py-6">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                      isCorrect ? 'bg-green-500' : 'bg-red-500'
                    )}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-base font-semibold leading-snug text-gray-900">
                        {question.question_text}
                      </h3>
                      {isCorrect ? (
                        <Badge variant="default" className="shrink-0 bg-green-500">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Correct
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="shrink-0">
                          <XCircle className="mr-1 h-3 w-3" />
                          Incorrect
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const isUserAnswer = userAnswer.includes(option.key)
                        const isCorrectAnswer = correctAnswers.includes(option.key)
                        let visual: QuizOptionVisual = 'default'
                        if (isCorrectAnswer) visual = 'correct'
                        else if (isUserAnswer && !isCorrectAnswer) visual = 'incorrect'

                        return (
                          <QuizOptionRow
                            key={option.key}
                            optionKey={option.key}
                            text={option.text}
                            visual={visual}
                            interactive={false}
                            suffix={
                              <>
                                {isUserAnswer && (
                                  <span className="ml-2 text-xs font-semibold text-brand-navy">
                                    Your answer
                                  </span>
                                )}
                                {isCorrectAnswer && (
                                  <span className="ml-2 text-xs font-semibold text-green-700">
                                    Correct
                                  </span>
                                )}
                              </>
                            }
                          />
                        )
                      })}
                    </div>

                    {question.explanation && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                          Explanation
                        </p>
                        <p className="text-sm text-blue-800">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ExamResultActions />
    </div>
  )
}
