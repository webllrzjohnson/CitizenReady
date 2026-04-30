'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { submitMockExam } from '@/actions/exam'
import { useExamTimer } from '@/hooks/useExamTimer'
import type { Question } from '@/types'
import { cn } from '@/lib/utils'
import { Clock, ChevronLeft, ChevronRight, AlertCircle, Trophy, CheckCircle2, XCircle } from 'lucide-react'
import QuestionCard from '@/components/quiz/QuestionCard'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { QuizOptionRow, type QuizOptionVisual } from '@/components/quiz/QuizOptionRow'
import { mockExamPassingCorrectCount, EXAM_CONFIG } from '@/lib/constants'

const GUEST_EXAM_PAYLOAD_KEY = 'citizenready_guest_exam_payload'
const GUEST_EXAM_USED_KEY = 'citizenready_guest_mock_exam_used'

type GuestExamReviewItem = {
  question: Question
  userAnswer: string[]
  isCorrect: boolean
}

type GuestExamResults = {
  score: number
  total: number
  review: GuestExamReviewItem[]
}

interface ExamSessionPageProps {
  params: Promise<{ sessionId: string }>
}

function answersMatch(userAnswer: string[], correctAnswers: string[]) {
  return (
    userAnswer.length === correctAnswers.length &&
    userAnswer.every((a) => correctAnswers.includes(a))
  )
}

export default function ExamSessionPage({ params }: ExamSessionPageProps) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [guestResults, setGuestResults] = useState<GuestExamResults | null>(null)

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId))
  }, [params])

  const handleTimeExpire = async () => {
    if (!submitted && !isSubmitting && guestResults === null) {
      await handleSubmitExam(true)
    }
  }

  const { timeRemaining, formattedTime } = useExamTimer({
    initialSeconds: 1800,
    onExpire: handleTimeExpire,
  })

  useEffect(() => {
    if (!sessionId) return

    async function loadSession() {
      try {
        setLoading(true)
        setError(null)

        if (sessionId === 'guest') {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            router.replace('/dashboard/mock-exam')
            return
          }

          const raw =
            typeof window !== 'undefined' ? sessionStorage.getItem(GUEST_EXAM_PAYLOAD_KEY) : null
          if (!raw) {
            setError('Exam data not found. Start a new mock exam from the mock exam page.')
            return
          }

          const parsed = JSON.parse(raw) as { questions: Question[] }
          if (!parsed.questions?.length) {
            setError('Could not load exam questions.')
            return
          }

          setQuestions(parsed.questions)
          return
        }

        const supabase = createClient()

        const { data: sessionData, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (sessionError || !sessionData) {
          setError('Session not found')
          return
        }

        const typedSession = sessionData as {
          completed_at: string | null
          question_ids: string[]
        }

        if (typedSession.completed_at) {
          router.push(`/dashboard/mock-exam/${sessionId}/results`)
          return
        }

        const questionIds = typedSession.question_ids as string[]

        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .in('id', questionIds)

        if (questionsError || !questionsData) {
          setError('Failed to load questions')
          return
        }

        const typedQuestions = questionsData as Record<string, unknown>[]

        const orderedQuestions = questionIds
          .map((id) => typedQuestions.find((q) => (q as { id: string }).id === id))
          .filter(Boolean)
          .map(
            (q) =>
              ({
                id: (q as { id: string }).id,
                topic_id: (q as { topic_id: string }).topic_id,
                type: (q as { type: string }).type as
                  | 'single'
                  | 'multiple'
                  | 'boolean'
                  | 'fill'
                  | 'matching',
                question_text: (q as { question_text: string }).question_text,
                options: (q as { options: { key: string; text: string }[] }).options,
                correct_answers: (q as { correct_answers: string[] }).correct_answers,
                explanation: (q as { explanation: string | null }).explanation,
                difficulty: (q as { difficulty: string }).difficulty as 'easy' | 'medium' | 'hard',
                is_active: (q as { is_active: boolean }).is_active,
                created_at: (q as { created_at: string }).created_at,
              }) as Question
          )

        setQuestions(orderedQuestions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam')
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [sessionId, router])

  const handleAnswerSelect = (questionId: string, answerKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: [answerKey],
    }))
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleSubmitClick = () => {
    setShowSubmitDialog(true)
  }

  const handleSubmitExam = async (_autoSubmit = false) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setShowSubmitDialog(false)

    try {
      if (sessionId === 'guest') {
        let score = 0
        const review: GuestExamReviewItem[] = questions.map((q) => {
          const ua = answers[q.id] || []
          const ca = q.correct_answers ?? []
          const isCorrect = answersMatch(ua, ca)
          if (isCorrect) score++
          return { question: q, userAnswer: ua, isCorrect }
        })

        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(GUEST_EXAM_USED_KEY, '1')
            sessionStorage.removeItem(GUEST_EXAM_PAYLOAD_KEY)
          }
        } catch {
          /* ignore */
        }

        setGuestResults({ score, total: questions.length, review })
        setSubmitted(true)
        setIsSubmitting(false)
        return
      }

      const result = await submitMockExam(sessionId, answers)

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
        return
      }

      if (result.success) {
        setSubmitted(true)
        router.push(`/dashboard/mock-exam/${sessionId}/results`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit exam')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
          <p className="text-[#424242]">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-surface-border bg-surface-card">
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-brand-red" />
            <p className="mb-4 text-brand-red">{error}</p>
            <Button
              onClick={() => router.push('/dashboard/mock-exam')}
              className="bg-brand-red text-white hover:bg-brand-red-dark"
            >
              Back to Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (guestResults) {
    const { score, total, review } = guestResults
    const percentage = Math.round((score / total) * 100)
    const passNeed = mockExamPassingCorrectCount(total)
    const passed = score >= passNeed

    return (
      <div className="container mx-auto max-w-5xl py-8">
        <Card
          className={cn(
            'mb-8 border-2',
            passed
              ? 'border-green-500 bg-green-50 dark:bg-green-950'
              : 'border-red-500 bg-red-50 dark:bg-red-950'
          )}
        >
          <CardContent className="py-8 text-center">
            <div className="mb-4">
              {passed ? (
                <Trophy className="mx-auto h-20 w-20 text-green-600" />
              ) : (
                <AlertCircle className="mx-auto h-20 w-20 text-red-600" />
              )}
            </div>
            <h1
              className={cn(
                'mb-2 text-4xl font-bold',
                passed ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
              )}
            >
              {passed ? 'PASSED' : 'FAILED'}
            </h1>
            <div className="my-4 text-6xl font-bold">
              {score} / {total}
            </div>
            <div className="mb-4 text-3xl text-muted-foreground">{percentage}%</div>
            <p
              className={cn(
                'text-lg',
                passed ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              )}
            >
              {passed
                ? 'Congratulations! You passed the mock citizenship exam.'
                : `Keep practicing. You need ${passNeed}/${total} (${EXAM_CONFIG.PASSING_SCORE}%) to pass.`}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 border-brand-red/20 bg-amber-50/60">
          <CardHeader>
            <CardTitle className="text-lg">Save your results and track progress</CardTitle>
            <CardDescription>
              Create a free CitizenReady account to store mock exam history, practice scores, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className="bg-brand-red text-white hover:bg-brand-red-dark">
              <Link href="/signup">Sign Up Free</Link>
            </Button>
            <Link
              href="/dashboard"
              className="text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-left"
            >
              Continue as Guest
            </Link>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Your answers and correct responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {review.map((item, idx) => {
                const question = item.question
                const userAnswer = item.userAnswer
                const correctAnswers = question.correct_answers ?? []
                const isCorrect = item.isCorrect

                return (
                  <div key={question.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                          isCorrect ? 'bg-green-500' : 'bg-red-500'
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold">{question.question_text}</h3>
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

                        <div className="ml-4 space-y-3">
                          {question.options?.map((option) => {
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
                          <div className="ml-4 mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                            <p className="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
                              Explanation:
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {idx < review.length - 1 && <Separator className="my-6" />}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            variant="outline"
            className="border-surface-border"
            onClick={() => router.push('/dashboard/practice')}
          >
            Practice by topic
          </Button>
          <Button
            className="bg-brand-red text-white hover:bg-brand-red-dark"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-surface-border bg-surface-card">
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-[#424242]">No questions available</p>
            <Button
              onClick={() => router.push('/dashboard/mock-exam')}
              className="bg-brand-red text-white hover:bg-brand-red-dark"
            >
              Back to Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const isLastQuestion = currentIndex === questions.length - 1
  const progressPct = ((currentIndex + 1) / questions.length) * 100
  const timerUrgent = timeRemaining <= 300

  return (
    <div className="mx-auto max-w-4xl py-6 md:py-8">
      <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-surface-border">
        <div
          className="h-full rounded-full bg-brand-red transition-[width] duration-300 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-brand-navy">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <div
          className={cn(
            'flex items-center gap-2 self-end sm:self-auto',
            timerUrgent && 'text-brand-red'
          )}
        >
          <Clock className={cn('h-5 w-5', timerUrgent ? 'text-brand-red' : 'text-[#424242]')} />
          <span className="font-mono text-lg font-bold tabular-nums">{formattedTime}</span>
        </div>
      </div>

      <div className="mb-8">
        <QuestionCard
          question={currentQuestion}
          selectedKeys={answers[currentQuestion.id] ?? []}
          onSelect={handleAnswerSelect}
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {questions.map((q, idx) => {
          const isAnswered = !!answers[q.id]
          const isCurrent = idx === currentIndex

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all',
                isCurrent && 'ring-2 ring-brand-red ring-offset-2 ring-offset-surface-page',
                isCurrent && isAnswered && 'bg-brand-red text-white',
                isCurrent && !isAnswered && 'bg-gray-300 text-gray-800',
                !isCurrent && isAnswered && 'bg-brand-red text-white',
                !isCurrent && !isAnswered && 'bg-gray-300 text-gray-600'
              )}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
          className="border-surface-border"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        <div className="order-first text-center text-sm text-[#424242] sm:order-none">
          <span className="font-semibold text-brand-navy">
            {answeredCount}/{questions.length}
          </span>{' '}
          answered
        </div>

        {!isLastQuestion ? (
          <Button
            onClick={handleNext}
            className="bg-brand-red text-white hover:bg-brand-red-dark"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className="bg-brand-red text-white hover:bg-brand-red-dark"
          >
            Submit Exam
          </Button>
        )}
      </div>

      {currentIndex >= 10 && !isLastQuestion && (
        <div className="mt-6 text-center">
          <Button
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            size="lg"
            className="bg-brand-red text-white hover:bg-brand-red-dark"
          >
            Submit Exam
          </Button>
        </div>
      )}

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="mt-2 block font-semibold text-brand-red">
                  {questions.length - answeredCount} questions remain unanswered.
                </span>
              )}
              <span className="mt-2 block">
                Once submitted, you cannot change your answers. Are you sure you want to submit now?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubmitExam(false)}
              className="bg-brand-red text-white hover:bg-brand-red-dark"
            >
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {timeRemaining <= 300 && timeRemaining > 0 && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-brand-red p-4 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Less than 5 minutes remaining!</span>
          </div>
        </div>
      )}
    </div>
  )
}
