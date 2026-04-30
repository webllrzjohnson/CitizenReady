import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  if (!user) {
    redirect('/login')
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !sessionData) {
    redirect('/dashboard/mock-exam')
  }

  const session = sessionData as {
    id: string
    score: number | null
    total_q: number
    completed_at: string | null
    created_at: string
    question_ids: unknown
  }

  if (!session.completed_at) {
    redirect(`/dashboard/mock-exam/${sessionId}`)
  }

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
    .map(qid => attempts.find(a => a.question_id === qid))
    .filter(Boolean)

  const score = session.score ?? 0
  const total = session.total_q
  const percentage = Math.round((score / total) * 100)
  const passed = score >= 15

  const timeTaken = session.completed_at && session.created_at
    ? Math.round((new Date(session.completed_at).getTime() - new Date(session.created_at).getTime()) / 1000 / 60)
    : 0

  const completedDate = session.completed_at 
    ? new Date(session.completed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      {/* Pass/Fail Banner */}
      <Card className={cn(
        'mb-8 border-2',
        passed ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'
      )}>
        <CardContent className="py-8 text-center">
          <div className="mb-4">
            {passed ? (
              <Trophy className="w-20 h-20 text-green-600 mx-auto" />
            ) : (
              <AlertCircle className="w-20 h-20 text-red-600 mx-auto" />
            )}
          </div>
          <h1 className={cn(
            'text-4xl font-bold mb-2',
            passed ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
          )}>
            {passed ? 'PASSED' : 'FAILED'}
          </h1>
          <div className="text-6xl font-bold my-4">
            {score} / {total}
          </div>
          <div className="text-3xl text-muted-foreground mb-4">
            {percentage}%
          </div>
          <p className={cn(
            'text-lg',
            passed ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
          )}>
            {passed 
              ? 'Congratulations! You passed the mock citizenship exam.' 
              : 'Keep practicing. You need 15/20 (75%) to pass.'}
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Score</p>
                <p className="text-2xl font-bold">{score}/{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Taken</p>
                <p className="text-2xl font-bold">{timeTaken} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-sm font-semibold">{completedDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Review */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
          <CardDescription>
            Review all questions, your answers, and explanations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
                <div key={attempt.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mt-1',
                      isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    )}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-semibold text-lg">{question.question_text}</h3>
                        {isCorrect ? (
                          <Badge variant="default" className="bg-green-500 flex-shrink-0">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex-shrink-0">
                            <XCircle className="w-3 h-3 mr-1" />
                            Incorrect
                          </Badge>
                        )}
                      </div>

                      <div className="ml-4 space-y-3">
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
                                    <span className="ml-2 text-sm font-semibold text-brand-navy">
                                      (Your answer)
                                    </span>
                                  )}
                                  {isCorrectAnswer && (
                                    <span className="ml-2 text-sm font-semibold text-green-700">
                                      (Correct answer)
                                    </span>
                                  )}
                                </>
                              }
                            />
                          )
                        })}
                      </div>

                      {question.explanation && (
                        <div className="mt-3 ml-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            Explanation:
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {idx < orderedAttempts.length - 1 && (
                    <Separator className="my-6" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <ExamResultActions />
    </div>
  )
}
